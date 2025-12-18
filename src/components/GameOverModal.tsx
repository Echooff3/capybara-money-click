import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play } from '@phosphor-icons/react'

interface GameOverModalProps {
  finalScore: number
  highScore: number
  onRestart: () => void
}

export function GameOverModal({ finalScore, highScore, onRestart }: GameOverModalProps) {
  const isNewHighScore = finalScore === highScore && finalScore > 0

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      style={{ willChange: 'opacity' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{ willChange: 'transform, opacity' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
      >
        <Card className="p-8 max-w-md w-full text-center space-y-6 border-2 border-primary glow">
          <motion.div
            className="text-6xl"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            😢
          </motion.div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl text-destructive">Game Over!</h2>
            <p className="font-body text-muted-foreground">
              You ran out of money!
            </p>
          </div>

          {isNewHighScore && (
            <motion.div
              className="p-4 bg-accent/20 rounded-lg border-2 border-accent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
            >
              <p className="font-display text-accent text-xl">
                🏆 New High Score! 🏆
              </p>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <p className="font-body text-sm text-muted-foreground mb-1">
                Final Score
              </p>
              <p className="font-display text-2xl text-primary">
                ${finalScore.toLocaleString()}
              </p>
            </div>

            <Button
              onClick={onRestart}
              size="lg"
              className="w-full font-body text-lg gap-2 glow"
            >
              <Play size={24} weight="fill" />
              Try Again
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
