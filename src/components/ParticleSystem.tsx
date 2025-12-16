import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import particleImg from '@/assets/images/particle.png'

export type PowerUpType = 'multiplier' | 'turbo' | 'shield' | 'mega' | null

interface Particle {
  id: number
  x: number
  y: number
  driftX: number
  driftY: number
  rotation: number
  size: number
  duration: number
  wobble: number
  type: 'image' | 'spark' | 'trail' | 'bubble' | 'explosion'
  color?: string
}

interface ParticleSystemProps {
  isActive: boolean
  centerX: number
  centerY: number
  powerUpType?: PowerUpType
}

const POWER_UP_CONFIGS = {
  multiplier: {
    color: '#FFD700',
    particleCount: 3,
    spawnRate: 60,
    velocity: { min: 120, max: 200 },
    size: { min: 8, max: 16 },
    duration: { min: 0.8, max: 1.4 },
    particleTypes: ['spark', 'image'] as const,
    glow: 'rgba(255, 215, 0, 0.9)',
  },
  turbo: {
    color: '#FF6B35',
    particleCount: 4,
    spawnRate: 40,
    velocity: { min: 200, max: 350 },
    size: { min: 12, max: 24 },
    duration: { min: 0.5, max: 1.0 },
    particleTypes: ['trail', 'image'] as const,
    glow: 'rgba(255, 107, 53, 0.9)',
  },
  shield: {
    color: '#4ECDC4',
    particleCount: 2,
    spawnRate: 90,
    velocity: { min: 80, max: 140 },
    size: { min: 16, max: 28 },
    duration: { min: 1.2, max: 2.0 },
    particleTypes: ['bubble', 'image'] as const,
    glow: 'rgba(78, 205, 196, 0.8)',
  },
  mega: {
    color: '#FF006E',
    particleCount: 6,
    spawnRate: 35,
    velocity: { min: 150, max: 300 },
    size: { min: 10, max: 20 },
    duration: { min: 0.6, max: 1.2 },
    particleTypes: ['explosion', 'spark', 'image'] as const,
    glow: 'rgba(255, 0, 110, 1.0)',
  },
}

export function ParticleSystem({ isActive, centerX, centerY, powerUpType = null }: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }

    const config = powerUpType ? POWER_UP_CONFIGS[powerUpType] : {
      color: '#FFD700',
      particleCount: 2,
      spawnRate: 80,
      velocity: { min: 100, max: 150 },
      size: { min: 30, max: 70 },
      duration: { min: 1, max: 1.8 },
      particleTypes: ['image'] as const,
      glow: 'rgba(255, 215, 0, 0.8)',
    }

    const interval = setInterval(() => {
      const particleCount = Math.random() > 0.5 ? config.particleCount : Math.floor(config.particleCount / 2)
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const velocity = config.velocity.min + Math.random() * (config.velocity.max - config.velocity.min)
        const particleType = config.particleTypes[Math.floor(Math.random() * config.particleTypes.length)]
        
        const newParticle: Particle = {
          id: Date.now() + Math.random(),
          x: centerX + (Math.random() - 0.5) * 120,
          y: centerY,
          driftX: Math.cos(angle) * velocity,
          driftY: Math.sin(angle) * velocity * (powerUpType === 'turbo' ? 0.3 : 1),
          rotation: (Math.random() - 0.5) * 720,
          size: config.size.min + Math.random() * (config.size.max - config.size.min),
          duration: config.duration.min + Math.random() * (config.duration.max - config.duration.min),
          wobble: (Math.random() - 0.5) * 40,
          type: particleType,
          color: config.color,
        }

        setParticles((prev) => [...prev, newParticle])

        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
        }, newParticle.duration * 1000 + 200)
      }
    }, config.spawnRate)

    return () => clearInterval(interval)
  }, [isActive, centerX, centerY, powerUpType])

  const renderParticle = (particle: Particle) => {
    const config = powerUpType ? POWER_UP_CONFIGS[powerUpType] : null
    const glowColor = config?.glow || 'rgba(255, 215, 0, 0.8)'

    switch (particle.type) {
      case 'spark':
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size}px ${glowColor}`,
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 1,
              scale: 0.2,
            }}
            animate={{
              y: particle.y - 220 - Math.random() * 120,
              x: particle.x + particle.driftX * 0.5,
              opacity: 0,
              scale: [0.2, 1.5, 0.5],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: particle.duration,
              ease: 'easeOut',
            }}
          />
        )

      case 'trail':
        return (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              width: `${particle.size * 3}px`,
              height: `${particle.size}px`,
              background: `linear-gradient(90deg, ${particle.color} 0%, transparent 100%)`,
              borderRadius: `${particle.size / 2}px`,
              boxShadow: `0 0 ${particle.size * 2}px ${glowColor}`,
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 1,
              scale: 0.5,
              rotate: particle.rotation,
            }}
            animate={{
              y: particle.y - 250 - Math.random() * 80,
              x: particle.x + particle.driftX * 0.8,
              opacity: 0,
              scale: [0.5, 1.2, 0.3],
              rotate: particle.rotation + 360,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: particle.duration,
              ease: [0.6, 0.05, 0.01, 0.9],
            }}
          />
        )

      case 'bubble':
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full border-2"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderColor: particle.color,
              backgroundColor: `${particle.color}20`,
              boxShadow: `0 0 ${particle.size}px ${glowColor}, inset 0 0 ${particle.size / 2}px ${glowColor}`,
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 1,
              scale: 0.3,
            }}
            animate={{
              y: particle.y - 180 - Math.random() * 100,
              x: particle.x + Math.sin(Date.now() * 0.005) * particle.wobble * 2,
              opacity: 0,
              scale: [0.3, 1.4, 1.0],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: particle.duration,
              ease: 'easeOut',
              x: {
                duration: particle.duration,
                repeat: 3,
                repeatType: 'mirror',
              },
            }}
          />
        )

      case 'explosion':
        return (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 1,
              scale: 0.1,
            }}
            animate={{
              y: particle.y + particle.driftY - 200,
              x: particle.x + particle.driftX,
              opacity: 0,
              scale: [0.1, 1.8, 0.8],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: particle.duration,
              ease: [0.87, 0, 0.13, 1],
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${glowColor}, 0 0 ${particle.size}px ${glowColor}`,
              }}
            />
          </motion.div>
        )

      case 'image':
      default:
        return (
          <motion.img
            key={particle.id}
            src={particleImg}
            alt=""
            className="absolute"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              filter: powerUpType 
                ? `drop-shadow(0 0 ${particle.size / 2}px ${glowColor}) hue-rotate(${
                    powerUpType === 'turbo' ? '-20deg' :
                    powerUpType === 'shield' ? '140deg' :
                    powerUpType === 'mega' ? '280deg' : '0deg'
                  })`
                : `drop-shadow(0 0 8px ${glowColor})`,
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 1,
              scale: 0.3,
              rotate: 0,
            }}
            animate={{
              y: particle.y - 200 - Math.random() * 100,
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
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {particles.map((particle) => renderParticle(particle))}
      </AnimatePresence>
    </div>
  )
}
