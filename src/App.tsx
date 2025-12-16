import { useState, useEffect, useRef, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { CapybaraButton } from '@/components/CapybaraButton'
import { ParticleSystem } from '@/components/ParticleSystem'
import { GameOverModal } from '@/components/GameOverModal'
import { Toaster, toast } from 'sonner'

const STARTING_MONEY = 1_000_000
const GAIN_RATE = 1000
const DRAIN_RATE = 5000
const UPDATE_INTERVAL = 50

function App() {
  const [money, setMoney] = useState(STARTING_MONEY)
  const [highScore, setHighScore] = useKV<number>('capybara-high-score', STARTING_MONEY)
  const [isPressed, setIsPressed] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 })
  const [isIncreasing, setIsIncreasing] = useState(false)
  const [isDecreasing, setIsDecreasing] = useState(false)

  const gameLoopRef = useRef<number | undefined>(undefined)
  const lastUpdateRef = useRef<number>(Date.now())
  const isDocumentVisible = useRef(true)

  const currentHighScore = highScore ?? STARTING_MONEY

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
        newMoney += GAIN_RATE * deltaTime
        setIsIncreasing(true)
        setIsDecreasing(false)
      } else {
        newMoney -= DRAIN_RATE * deltaTime
        setIsIncreasing(false)
        setIsDecreasing(true)
      }

      if (newMoney <= 0) {
        newMoney = 0
        setIsGameOver(true)
        setIsDecreasing(false)
      }

      if (newMoney > currentHighScore) {
        const shouldShowToast = newMoney > STARTING_MONEY && currentHighScore <= STARTING_MONEY
        setHighScore(newMoney)
        if (shouldShowToast) {
          toast('New High Score! 🏆', {
            description: `$${Math.round(newMoney).toLocaleString()}`,
          })
        }
      }

      return newMoney
    })
  }, [isPressed, isGameOver, currentHighScore, setHighScore])

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
    lastUpdateRef.current = Date.now()
  }

  const handlePositionUpdate = (x: number, y: number) => {
    setParticlePosition({ x, y })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col items-center justify-between p-6 overflow-hidden relative">
      <Toaster position="top-center" theme="dark" />
      
      <ParticleSystem
        isActive={isPressed && !isGameOver}
        centerX={particlePosition.x}
        centerY={particlePosition.y}
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
                ${Math.round(currentHighScore).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 md:gap-12 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="font-display text-2xl md:text-3xl text-center text-primary mb-2">
            Capybara Money Game
          </h1>
          <p className="font-body text-center text-muted-foreground text-sm md:text-base">
            Hold the capybara to gain money. Let go and watch it drain!
          </p>
        </motion.div>

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

        {!isGameOver && (
          <motion.p
            className="font-body text-center text-muted-foreground text-sm max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isPressed ? '💰 Keep holding! 💰' : '⚠️ Money is draining! ⚠️'}
          </motion.p>
        )}
      </div>

      <div className="h-20" />

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