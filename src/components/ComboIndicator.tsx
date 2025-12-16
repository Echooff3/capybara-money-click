import { motion, AnimatePresence } from 'framer-motion'
import { Star, Flame } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'

interface ComboIndicatorProps {
  combo: number
  multiplier: number
}

const COMBO_COLORS = {
  1: '#FFD700',
  2: '#FF8C00',
  3: '#FF4500',
  4: '#FF006E',
  5: '#9D00FF',
}

const getComboColor = (combo: number): string => {
  if (combo >= 5) return COMBO_COLORS[5]
  if (combo >= 4) return COMBO_COLORS[4]
  if (combo >= 3) return COMBO_COLORS[3]
  if (combo >= 2) return COMBO_COLORS[2]
  return COMBO_COLORS[1]
}

const getComboLabel = (combo: number): string => {
  if (combo >= 5) return 'LEGENDARY!'
  if (combo >= 4) return 'EPIC!'
  if (combo >= 3) return 'SUPER!'
  if (combo >= 2) return 'GREAT!'
  return 'COMBO!'
}

export function ComboIndicator({ combo, multiplier }: ComboIndicatorProps) {
  if (combo < 2) return null

  const color = getComboColor(combo)
  const label = getComboLabel(combo)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        initial={{ scale: 0, rotate: -45, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 45, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      >
        <Card className="relative overflow-hidden border-4 bg-background/95 backdrop-blur-md p-6 shadow-2xl"
          style={{ borderColor: color }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: color, opacity: 0.15 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute -inset-4 opacity-30 blur-3xl"
            style={{ backgroundColor: color }}
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <div className="relative flex flex-col items-center gap-2">
            <motion.div
              className="flex items-center gap-1"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {combo >= 5 && (
                <>
                  <Flame size={28} weight="fill" style={{ color }} />
                  <Flame size={28} weight="fill" style={{ color }} />
                  <Flame size={28} weight="fill" style={{ color }} />
                </>
              )}
              {combo >= 3 && combo < 5 && (
                <>
                  <Star size={28} weight="fill" style={{ color }} />
                  <Star size={28} weight="fill" style={{ color }} />
                </>
              )}
              {combo === 2 && (
                <Star size={28} weight="fill" style={{ color }} />
              )}
            </motion.div>

            <div className="text-center">
              <motion.p
                className="font-display text-4xl md:text-5xl font-bold"
                style={{ color }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              >
                {combo}x COMBO
              </motion.p>
              <p className="font-display text-xl mt-1" style={{ color }}>
                {label}
              </p>
            </div>

            <motion.div
              className="mt-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                boxShadow: [
                  `0 0 20px ${color}`,
                  `0 0 40px ${color}`,
                  `0 0 20px ${color}`,
                ],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <p className="font-display text-lg text-white">
                +{multiplier.toFixed(1)}x Bonus
              </p>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
