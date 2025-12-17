import { motion, AnimatePresence } from 'framer-motion'
import { Lightning, Fire, Sparkle, Rocket } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import type { PowerUpType } from './PowerUp'

export interface ActivePowerUp {
  type: PowerUpType
  expiresAt: number
  multiplier: number
}

interface ActivePowerUpsProps {
  powerUps: ActivePowerUp[]
}

const POWER_UP_CONFIG = {
  multiplier: { Icon: Lightning, color: '#FFD700', label: '2x Boost' },
  turbo: { Icon: Rocket, color: '#FF6B35', label: '3x Turbo' },
  shield: { Icon: Sparkle, color: '#4ECDC4', label: 'Shield Active' },
  mega: { Icon: Fire, color: '#FF006E', label: '5x MEGA!' },
}

export function ActivePowerUps({ powerUps }: ActivePowerUpsProps) {
  if (powerUps.length === 0) return null

  return (
    <motion.div
      className="fixed top-20 right-4 z-10 flex flex-col gap-2"
      style={{ willChange: 'transform, opacity' }}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <AnimatePresence mode="popLayout">
        {powerUps.map((powerUp, index) => {
          const { Icon, color, label } = POWER_UP_CONFIG[powerUp.type]
          const timeLeft = Math.max(0, powerUp.expiresAt - Date.now())
          const progress = (timeLeft / (powerUp.type === 'shield' ? 15000 : 10000)) * 100

          return (
            <motion.div
              key={`${powerUp.type}-${index}`}
              style={{ willChange: 'transform, opacity' }}
              initial={{ scale: 0, x: 50, rotate: 10 }}
              animate={{ scale: 1, x: 0, rotate: 0 }}
              exit={{ scale: 0, x: 50, rotate: -10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Card 
                className="relative overflow-hidden border-2 bg-card/95 backdrop-blur-sm p-3 min-w-[140px]"
                style={{ borderColor: color }}
              >
                <motion.div
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundColor: color }}
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                
                <div className="relative flex items-center gap-2">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Icon size={24} weight="fill" style={{ color }} />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-display text-xs" style={{ color }}>
                      {label}
                    </p>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: '100%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
