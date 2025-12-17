import { useEffect, useRef } from 'react'
import { Application, Assets, Sprite, Container, Texture } from 'pixi.js'
import particleImg from '@/assets/images/particle.png'

interface PixiParticleSystemProps {
  isActive: boolean
  centerX: number
  centerY: number
  powerUpType: string | null
}

interface Particle {
  sprite: Sprite
  vx: number
  vy: number
  life: number
  maxLife: number
  rotation: number
}

export function PixiParticleSystem({ isActive, centerX, centerY, powerUpType }: PixiParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<Application | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const containerRef = useRef<Container | null>(null)
  const textureRef = useRef<Texture | null>(null)
  const lastSpawnRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    let mounted = true
    const canvas = canvasRef.current

    const initPixi = async () => {
      const app = new Application()
      await app.init({
        canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })

      if (!mounted) {
        app.destroy(true)
        return
      }

      appRef.current = app

      const texture = await Assets.load(particleImg)
      textureRef.current = texture

      const container = new Container()
      app.stage.addChild(container)
      containerRef.current = container

      const handleResize = () => {
        if (appRef.current) {
          appRef.current.renderer.resize(window.innerWidth, window.innerHeight)
        }
      }

      window.addEventListener('resize', handleResize)

      const animate = () => {
        if (!mounted || !appRef.current || !containerRef.current) return

        const now = Date.now()
        const deltaTime = 0.016

        if (isActive && textureRef.current) {
          const spawnRate = powerUpType === 'mega' ? 3 : powerUpType === 'turbo' ? 2 : 1
          const particlesToSpawn = spawnRate * (powerUpType === 'shield' ? 0.5 : 1)

          if (now - lastSpawnRef.current > 16) {
            for (let i = 0; i < particlesToSpawn; i++) {
              createParticle(centerX, centerY, textureRef.current, containerRef.current)
            }
            lastSpawnRef.current = now
          }
        }

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const particle = particlesRef.current[i]
          
          particle.sprite.x += particle.vx * deltaTime * 60
          particle.sprite.y += particle.vy * deltaTime * 60
          particle.vy += 0.5
          particle.sprite.rotation += particle.rotation * deltaTime * 60

          particle.life -= deltaTime

          const lifeRatio = particle.life / particle.maxLife
          particle.sprite.alpha = lifeRatio

          if (particle.life <= 0) {
            containerRef.current?.removeChild(particle.sprite)
            particle.sprite.destroy()
            particlesRef.current.splice(i, 1)
          }
        }

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animate()

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }

    const cleanup = initPixi()

    return () => {
      mounted = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      cleanup?.then((cleanupFn) => cleanupFn?.())
      particlesRef.current.forEach((particle) => {
        particle.sprite.destroy()
      })
      particlesRef.current = []
      if (containerRef.current) {
        containerRef.current.destroy({ children: true })
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
      }
    }
  }, [])

  const createParticle = (x: number, y: number, texture: Texture, container: Container) => {
    const sprite = new Sprite(texture)
    
    const screenX = (x / 100) * window.innerWidth
    const screenY = (y / 100) * window.innerHeight
    
    sprite.anchor.set(0.5)
    sprite.x = screenX
    sprite.y = screenY

    const baseScale = powerUpType === 'mega' ? 1.5 : powerUpType === 'turbo' ? 1.2 : 1
    const scale = (0.3 + Math.random() * 0.4) * baseScale
    sprite.scale.set(scale)

    const angle = (Math.random() - 0.5) * Math.PI * 0.8
    const speed = 3 + Math.random() * 4
    const vx = Math.sin(angle) * speed * (powerUpType === 'turbo' ? 1.5 : 1)
    const vy = -Math.abs(Math.cos(angle)) * speed * (powerUpType === 'mega' ? 1.8 : 1.2) - 3

    let tint = 0xffffff
    if (powerUpType === 'multiplier') tint = 0xffd700
    else if (powerUpType === 'turbo') tint = 0xff6b6b
    else if (powerUpType === 'shield') tint = 0x4ecdc4
    else if (powerUpType === 'mega') tint = 0xff00ff

    sprite.tint = tint

    const maxLife = 1.5 + Math.random() * 0.5
    
    container.addChild(sprite)

    particlesRef.current.push({
      sprite,
      vx,
      vy,
      life: maxLife,
      maxLife,
      rotation: (Math.random() - 0.5) * 0.2,
    })
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
