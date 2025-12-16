import { motion } from 'framer-motion'
import happyCapybara from '@/assets/images/happy.png'
import notHappyCapybara from '@/assets/images/not_happy.png'

interface CapybaraButtonProps {
  isPressed: boolean
  onPressStart: () => void
  onPressEnd: () => void
  onPositionUpdate: (x: number, y: number) => void
}

export function CapybaraButton({
  isPressed,
  onPressStart,
  onPressEnd,
  onPositionUpdate,
}: CapybaraButtonProps) {
  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    onPositionUpdate(centerX, centerY)
    onPressStart()
  }

  const handleInteractionEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    onPressEnd()
  }

  return (
    <motion.div
      className="relative cursor-pointer touch-none select-none"
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onTouchCancel={handleInteractionEnd}
      animate={{
        scale: isPressed ? 0.95 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      initial={{ scale: 0, rotate: -10 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
    >
      <div className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] flex items-center justify-center">
        <img 
          src={isPressed ? happyCapybara : notHappyCapybara} 
          alt={isPressed ? "Happy Capybara" : "Not Happy Capybara"}
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      </div>
      {isPressed && (
        <motion.div
          className="absolute inset-0 rounded-full bg-accent/20 blur-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  )
}
