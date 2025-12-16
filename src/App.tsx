import { useState, useEffect, useRef, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { CapybaraButton } from '@/components/CapybaraButton'
import { ParticleSystem } from '@/components/ParticleSystem'
import { GameOverModal } from '@/components/GameOverModal'
import { PowerUp, type PowerUpData, type PowerUpType } from '@/components/PowerUp'
import { ActivePowerUps, type ActivePowerUp } from '@/components/ActivePowerUps'
import { MoneyJourneyGraph } from '@/components/MoneyJourneyGraph'
import { ComboIndicator } from '@/components/ComboIndicator'
import { ComboBadge } from '@/components/ComboBadge'
import { Toaster, toast } from 'sonner'

const STARTING_MONEY = 1_000_000
const GAIN_RATE = 1000
const DRAIN_RATE = 5000
const UPDATE_INTERVAL = 50
const POWER_UP_SPAWN_INTERVAL = 8000
const POWER_UP_DESPAWN_TIME = 6000
const HISTORY_SAMPLE_INTERVAL = 200
const COMBO_WINDOW = 5000
const COMBO_DISPLAY_DURATION = 3000

interface DataPoint {
  timestamp: number
  value: number
}

interface PowerUpMarker {
  timestamp: number
  type: PowerUpType
  value: number
}

interface ComboState {
  count: number
  lastCollectTime: number
  multiplier: number
  displayUntil: number
}

function App() {
  const [money, setMoney] = useState(STARTING_MONEY)
  const [highScore, setHighScore] = useKV<number>('capybara-high-score', STARTING_MONEY)
  const [isPressed, setIsPressed] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 })
  const [isIncreasing, setIsIncreasing] = useState(false)
  const [isDecreasing, setIsDecreasing] = useState(false)
  const [powerUps, setPowerUps] = useState<PowerUpData[]>([])
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([])
  const [moneyHistory, setMoneyHistory] = useState<DataPoint[]>([{ timestamp: Date.now(), value: STARTING_MONEY }])
  const [powerUpMarkers, setPowerUpMarkers] = useState<PowerUpMarker[]>([])
  const [combo, setCombo] = useState<ComboState>({
    count: 0,
    lastCollectTime: 0,
    multiplier: 1,
    displayUntil: 0,
  })
  const [showComboIndicator, setShowComboIndicator] = useState(false)

  const gameLoopRef = useRef<number | undefined>(undefined)
  const lastUpdateRef = useRef<number>(Date.now())
  const lastHistorySampleRef = useRef<number>(Date.now())
  const isDocumentVisible = useRef(true)
  const powerUpSpawnTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const powerUpDespawnTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const highScoreNotifiedRef = useRef(false)

  const currentHighScore = highScore ?? STARTING_MONEY
  const displayHighScore = Math.max(currentHighScore, money)

  const getPowerUpMultiplier = useCallback(() => {
    if (activePowerUps.length === 0) return 1
    const powerUpMultiplier = activePowerUps.reduce((total, powerUp) => total * powerUp.multiplier, 1)
    const comboMultiplier = combo.count >= 2 ? combo.multiplier : 1
    return powerUpMultiplier * comboMultiplier
  }, [activePowerUps, combo.multiplier, combo.count])

  const hasShield = activePowerUps.some(p => p.type === 'shield')
  const activePowerUpType = activePowerUps.length > 0 ? activePowerUps[activePowerUps.length - 1].type : null

  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisible.current = !document.hidden
      if (!document.hidden) {
        lastUpdateRef.current = Date.now()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const updateMoney = useCallback(() => {
    if (!isDocumentVisible.current || isGameOver) return

    const now = Date.now()
    const deltaTime = (now - lastUpdateRef.current) / 1000
    lastUpdateRef.current = now

    setMoney((currentMoney) => {
      let newMoney = currentMoney

      if (isPressed) {
        const multiplier = getPowerUpMultiplier()
        newMoney += GAIN_RATE * deltaTime * multiplier
        setIsIncreasing(true)
        setIsDecreasing(false)
      } else {
        if (!hasShield) {
          newMoney -= DRAIN_RATE * deltaTime
          setIsIncreasing(false)
          setIsDecreasing(true)
        } else {
          setIsIncreasing(false)
          setIsDecreasing(false)
        }
      }

      if (newMoney <= 0) {
        newMoney = 0
        setIsGameOver(true)
        setIsDecreasing(false)
      }

      if (newMoney > currentHighScore) {
        const shouldShowToast = !highScoreNotifiedRef.current && newMoney > STARTING_MONEY && currentHighScore <= STARTING_MONEY
        setHighScore(newMoney)
        if (shouldShowToast) {
          toast('New High Score! 🏆', {
            description: `$${Math.round(newMoney).toLocaleString()}`,
          })
          highScoreNotifiedRef.current = true
        }
      }

      if (now - lastHistorySampleRef.current >= HISTORY_SAMPLE_INTERVAL) {
        setMoneyHistory((current) => {
          const newHistory = [...current, { timestamp: now, value: newMoney }]
          if (newHistory.length > 500) {
            return newHistory.slice(-500)
          }
          return newHistory
        })
        lastHistorySampleRef.current = now
      }

      return newMoney
    })
  }, [isPressed, isGameOver, currentHighScore, setHighScore, getPowerUpMultiplier, hasShield])

  useEffect(() => {
    const gameLoop = () => {
      updateMoney()
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [updateMoney])

  useEffect(() => {
    setActivePowerUps((current) => {
      const now = Date.now()
      return current.filter((powerUp) => powerUp.expiresAt > now)
    })

    const interval = setInterval(() => {
      setActivePowerUps((current) => {
        const now = Date.now()
        return current.filter((powerUp) => powerUp.expiresAt > now)
      })
      
      setCombo((current) => {
        const now = Date.now()
        if (current.count >= 2 && now > current.displayUntil) {
          setShowComboIndicator(false)
          if (now - current.lastCollectTime > COMBO_WINDOW) {
            return {
              count: 0,
              lastCollectTime: 0,
              multiplier: 1,
              displayUntil: 0,
            }
          }
        }
        return current
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isGameOver) {
      if (powerUpSpawnTimerRef.current) {
        clearTimeout(powerUpSpawnTimerRef.current)
      }
      powerUpDespawnTimersRef.current.forEach((timer) => clearTimeout(timer))
      powerUpDespawnTimersRef.current.clear()
      setPowerUps([])
      setActivePowerUps([])
      return
    }

    const spawnPowerUp = () => {
      const types: PowerUpType[] = ['multiplier', 'turbo', 'shield', 'mega']
      const weights = [40, 30, 20, 10]
      
      const totalWeight = weights.reduce((sum, w) => sum + w, 0)
      let random = Math.random() * totalWeight
      
      let selectedType: PowerUpType = 'multiplier'
      for (let i = 0; i < types.length; i++) {
        random -= weights[i]
        if (random <= 0) {
          selectedType = types[i]
          break
        }
      }

      const newPowerUp: PowerUpData = {
        id: `${Date.now()}-${Math.random()}`,
        type: selectedType,
        x: 10 + Math.random() * 80,
        y: 20 + Math.random() * 60,
      }

      setPowerUps((current) => [...current, newPowerUp])

      const despawnTimer = setTimeout(() => {
        setPowerUps((current) => current.filter((p) => p.id !== newPowerUp.id))
        powerUpDespawnTimersRef.current.delete(newPowerUp.id)
      }, POWER_UP_DESPAWN_TIME)

      powerUpDespawnTimersRef.current.set(newPowerUp.id, despawnTimer)

      powerUpSpawnTimerRef.current = setTimeout(spawnPowerUp, POWER_UP_SPAWN_INTERVAL)
    }

    powerUpSpawnTimerRef.current = setTimeout(spawnPowerUp, POWER_UP_SPAWN_INTERVAL)

    return () => {
      if (powerUpSpawnTimerRef.current) {
        clearTimeout(powerUpSpawnTimerRef.current)
      }
      powerUpDespawnTimersRef.current.forEach((timer) => clearTimeout(timer))
      powerUpDespawnTimersRef.current.clear()
    }
  }, [isGameOver])

  const handleCollectPowerUp = (id: string, type: PowerUpType) => {
    setPowerUps((current) => current.filter((p) => p.id !== id))

    const despawnTimer = powerUpDespawnTimersRef.current.get(id)
    if (despawnTimer) {
      clearTimeout(despawnTimer)
      powerUpDespawnTimersRef.current.delete(id)
    }

    const now = Date.now()
    
    setCombo((current) => {
      const timeSinceLastCollect = now - current.lastCollectTime
      let newCount = current.count
      let newMultiplier = current.multiplier

      if (timeSinceLastCollect <= COMBO_WINDOW && current.count > 0) {
        newCount = current.count + 1
        newMultiplier = 1 + (newCount - 1) * 0.25
      } else {
        newCount = 1
        newMultiplier = 1
      }

      const newComboState = {
        count: newCount,
        lastCollectTime: now,
        multiplier: newMultiplier,
        displayUntil: now + COMBO_DISPLAY_DURATION,
      }

      if (newCount >= 2) {
        setShowComboIndicator(true)
        setTimeout(() => setShowComboIndicator(false), 1500)
      }

      return newComboState
    })

    const multiplierMap: Record<PowerUpType, number> = {
      multiplier: 2,
      turbo: 3,
      shield: 1,
      mega: 5,
    }

    const durationMap: Record<PowerUpType, number> = {
      multiplier: 10000,
      turbo: 10000,
      shield: 15000,
      mega: 10000,
    }

    const labelMap: Record<PowerUpType, string> = {
      multiplier: '2x Money Boost!',
      turbo: '3x Turbo Mode!',
      shield: 'Shield Active - No Drain!',
      mega: '5x MEGA BOOST!',
    }

    toast.success(labelMap[type], {
      description: type === 'shield' ? '15 seconds of protection' : `${durationMap[type] / 1000}s duration`,
    })

    const newActivePowerUp: ActivePowerUp = {
      type,
      expiresAt: Date.now() + durationMap[type],
      multiplier: multiplierMap[type],
    }

    setActivePowerUps((current) => [...current, newActivePowerUp])

    setPowerUpMarkers((current) => {
      const newMarkers = [...current, { timestamp: Date.now(), type, value: money }]
      if (newMarkers.length > 50) {
        return newMarkers.slice(-50)
      }
      return newMarkers
    })
  }

  const handlePressStart = () => {
    if (isGameOver) return
    setIsPressed(true)
  }

  const handlePressEnd = () => {
    setIsPressed(false)
  }

  const handleRestart = () => {
    setMoney(STARTING_MONEY)
    setIsGameOver(false)
    setIsPressed(false)
    setIsIncreasing(false)
    setIsDecreasing(false)
    setPowerUps([])
    setActivePowerUps([])
    lastUpdateRef.current = Date.now()
    lastHistorySampleRef.current = Date.now()
    setMoneyHistory([{ timestamp: Date.now(), value: STARTING_MONEY }])
    setPowerUpMarkers([])
    highScoreNotifiedRef.current = false
    setCombo({
      count: 0,
      lastCollectTime: 0,
      multiplier: 1,
      displayUntil: 0,
    })
    setShowComboIndicator(false)
  }

  const handlePositionUpdate = (x: number, y: number) => {
    setParticlePosition({ x, y })
  }

  const maxMoneyValue = Math.max(...moneyHistory.map(d => d.value), STARTING_MONEY, money)
  const comboTimeLeft = Math.max(0, combo.displayUntil - Date.now())

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col items-center justify-between p-6 overflow-hidden relative">
      <Toaster position="bottom-center" theme="dark" />
      
      <MoneyJourneyGraph
        dataPoints={moneyHistory}
        powerUpMarkers={powerUpMarkers}
        maxValue={maxMoneyValue}
        startingValue={STARTING_MONEY}
      />
      
      <ParticleSystem
        isActive={isPressed && !isGameOver}
        centerX={particlePosition.x}
        centerY={particlePosition.y}
        powerUpType={activePowerUpType}
      />

      <AnimatePresence>
        {powerUps.map((powerUp) => (
          <PowerUp
            key={powerUp.id}
            powerUp={powerUp}
            onCollect={handleCollectPowerUp}
            disabled={isPressed}
          />
        ))}
      </AnimatePresence>

      <ActivePowerUps powerUps={activePowerUps} />

      {showComboIndicator && (
        <ComboIndicator combo={combo.count} multiplier={combo.multiplier} />
      )}

      <ComboBadge
        combo={combo.count}
        multiplier={combo.multiplier}
        timeLeft={comboTimeLeft}
        maxTime={COMBO_DISPLAY_DURATION}
      />

      <motion.div
        className="fixed top-4 right-4 z-10"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.3 }}
      >
        <Card className="p-4 border-2 border-primary/50 bg-card/90 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Trophy size={24} weight="fill" className="text-accent" />
            <div>
              <p className="font-body text-xs text-muted-foreground">High Score</p>
              <p className="font-display text-lg text-primary">
                ${Math.round(displayHighScore).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 md:gap-12 max-w-2xl w-full">
        <AnimatedCounter
          value={money}
          isIncreasing={isIncreasing}
          isDecreasing={isDecreasing}
        />

        <CapybaraButton
          isPressed={isPressed}
          onPressStart={handlePressStart}
          onPressEnd={handlePressEnd}
          onPositionUpdate={handlePositionUpdate}
        />
      </div>

      <div className="pb-6 flex flex-col items-center gap-3 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h1 className="font-display text-xl md:text-2xl text-primary mb-1">
            Capybara Money Game
          </h1>
          <p className="font-body text-muted-foreground text-xs md:text-sm">
            Hold the capybara to gain money. Collect power-ups to boost earnings!
          </p>
        </motion.div>

        {!isGameOver && (
          <motion.p
            className="font-body text-center text-muted-foreground text-sm max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isPressed 
              ? activePowerUps.length > 0 
                ? '🔥 BOOSTED! 🔥' 
                : powerUps.length > 0
                ? '⚠️ Release to collect power-ups! ⚠️'
                : '💰 Keep holding! 💰'
              : hasShield
              ? '🛡️ Protected by shield! 🛡️'
              : '⚠️ Money is draining! ⚠️'}
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {isGameOver && (
          <GameOverModal
            finalScore={Math.round(money)}
            highScore={Math.round(currentHighScore)}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App