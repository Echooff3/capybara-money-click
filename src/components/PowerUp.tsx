import { motion } from 'framer-motion'
import { Lightning, Fire, Sparkle, Rocket } from '@phosphor-icons/react'

export type PowerUpType = 'multiplier' | 'turbo' | 'shield' | 'mega'

export interface PowerUpData {
  id: string
  type: PowerUpType
  x: number
  y: number
}

interface PowerUpProps {
  powerUp: PowerUpData
  onCollect: (id: string, type: PowerUpType) => void
  disabled?: boolean
}

const POWER_UP_ICONS = {
  multiplier: { Icon: Lightning, color: '#FFD700', label: '2x' },
  turbo: { Icon: Rocket, color: '#FF6B35', label: '3x' },
  shield: { Icon: Sparkle, color: '#4ECDC4', label: 'Shield' },
  mega: { Icon: Fire, color: '#FF006E', label: '5x' },
}

export function PowerUp({ powerUp, onCollect, disabled = false }: PowerUpProps) {
  const { Icon, color, label } = POWER_UP_ICONS[powerUp.type]

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    onCollect(powerUp.id, powerUp.type)
  }

  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: `${powerUp.x}%`,
        top: `${powerUp.y}%`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        willChange: 'transform, opacity',
      }}
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ 
        scale: 1, 
        opacity: disabled ? 0.4 : 1, 
        rotate: 0,
        y: [0, -10, 0],
      }}
      exit={{ scale: 0, opacity: 0, rotate: 180 }}
      transition={{
        scale: { type: 'spring', stiffness: 400, damping: 20 },
        opacity: { duration: 0.2 },
        rotate: { duration: 0.5 },
        y: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      onClick={handleClick}
      onTouchStart={handleClick}
    >
      <motion.div
        className="relative"
        whileHover={disabled ? {} : { scale: 1.1 }}
        whileTap={disabled ? {} : { scale: 0.9 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: color }}
          animate={{
            opacity: disabled ? [0.1, 0.2, 0.1] : [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <div
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-4 shadow-lg transition-all"
          style={{ 
            backgroundColor: color,
            borderColor: 'white',
            filter: disabled ? 'grayscale(50%)' : 'none',
          }}
        >
          <Icon size={32} weight="fill" className="text-white" />
        </div>
        
        <div 
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-display text-xs sm:text-sm whitespace-nowrap px-2 py-1 rounded"
          style={{ 
            backgroundColor: color,
            color: 'white',
            filter: disabled ? 'grayscale(50%)' : 'none',
          }}
        >
          {label}
        </div>
      </motion.div>
    </motion.div>
  )
}
