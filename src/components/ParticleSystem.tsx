import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  driftX: number
  rotation: number
  emoji: string
  size: number
  color: string
  duration: number
  wobble: number
}

interface ParticleSystemProps {
  isActive: boolean
  centerX: number
  centerY: number
}

const EMOJIS = ['💰', '💵', '💴', '💶', '💷', '💸', '🤑', '💲', '🪙', '💳', '🏦', '📈', '💹', '✨', '⭐', '🌟', '💫', '🎉', '🎊', '🔥']
const COLORS = ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1', '#7B68EE', '#32CD32', '#FF1493']

export function ParticleSystem({ isActive, centerX, centerY }: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }

    const interval = setInterval(() => {
      const particleCount = Math.random() > 0.5 ? 2 : 1
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const velocity = 100 + Math.random() * 150
        const newParticle: Particle = {
          id: Date.now() + Math.random(),
          x: centerX + (Math.random() - 0.5) * 120,
          driftX: Math.cos(angle) * velocity,
          rotation: (Math.random() - 0.5) * 720,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          size: 30 + Math.random() * 40,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          duration: 1 + Math.random() * 0.8,
          wobble: (Math.random() - 0.5) * 40,
        }

        setParticles((prev) => [...prev, newParticle])

        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
        }, newParticle.duration * 1000 + 200)
      }
    }, 80)

    return () => clearInterval(interval)
  }, [isActive, centerX, centerY])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute font-display"
            style={{
              fontSize: `${particle.size}px`,
              filter: `drop-shadow(0 0 8px ${particle.color})`,
            }}
            initial={{
              x: particle.x,
              y: centerY,
              opacity: 1,
              scale: 0.3,
              rotate: 0,
            }}
            animate={{
              y: centerY - 200 - Math.random() * 100,
              x: particle.x + particle.driftX + Math.sin(Date.now() * 0.01) * particle.wobble,
              opacity: 0,
              scale: [0.3, 1.3, 0.8],
              rotate: particle.rotation,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: particle.duration,
              ease: [0.32, 0.72, 0, 1],
              scale: {
                times: [0, 0.3, 1],
                duration: particle.duration,
              },
            }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
