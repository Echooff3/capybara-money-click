import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  driftX: number
  rotation: number
}

interface ParticleSystemProps {
  isActive: boolean
  centerX: number
  centerY: number
}

export function ParticleSystem({ isActive, centerX, centerY }: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }

    const interval = setInterval(() => {
      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        x: centerX + (Math.random() - 0.5) * 100,
        driftX: (Math.random() - 0.5) * 100,
        rotation: (Math.random() - 0.5) * 360,
      }

      setParticles((prev) => [...prev, newParticle])

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
      }, 1200)
    }, 150)

    return () => clearInterval(interval)
  }, [isActive, centerX, centerY])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute text-4xl"
            initial={{
              x: particle.x,
              y: centerY,
              opacity: 1,
              scale: 0.5,
              rotate: 0,
            }}
            animate={{
              y: centerY - 150,
              x: particle.x + particle.driftX,
              opacity: 0,
              scale: 1,
              rotate: particle.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: 'easeOut',
            }}
          >
            💰
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
