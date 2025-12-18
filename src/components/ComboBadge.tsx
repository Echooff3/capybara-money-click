import { motion, AnimatePresence } from 'framer-motion'
import { Star } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'

interface ComboBadgeProps {
  combo: number
  multiplier: number
  timeLeft: number
  maxTime: number
}

const getComboColor = (combo: number): string => {
  if (combo >= 5) return '#9D00FF'
  if (combo >= 4) return '#FF006E'
  if (combo >= 3) return '#FF4500'
  if (combo >= 2) return '#FF8C00'
  return '#FFD700'
}

export function ComboBadge({ combo, multiplier, timeLeft, maxTime }: ComboBadgeProps) {
  if (combo < 2) return null

  const color = getComboColor(combo)
  const progress = (timeLeft / maxTime) * 100

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-32 left-4 z-10"
        style={{ willChange: 'transform, opacity' }}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Card
          className="relative overflow-hidden border-2 bg-card/95 backdrop-blur-sm p-3 min-w-[120px]"
          style={{ borderColor: color }}
        >
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{ backgroundColor: color }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <div className="relative flex items-center gap-2">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <Star size={24} weight="fill" style={{ color }} />
            </motion.div>
            <div className="flex-1">
              <p className="font-display text-sm font-bold" style={{ color }}>
                {combo}x COMBO
              </p>
              <p className="font-body text-xs text-muted-foreground">
                +{multiplier.toFixed(1)}x Bonus
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
    </AnimatePresence>
  )
}
