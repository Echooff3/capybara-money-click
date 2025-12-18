import { useEffect, useRef } from 'react'
import { Application, Graphics, Container } from 'pixi.js'
import { motion } from 'framer-motion'
import { Lightning, ShieldCheck, Rocket, Star } from '@phosphor-icons/react'
import type { PowerUpType } from './PowerUp'

interface DataPoint {
  timestamp: number
  value: number
}

interface PowerUpMarker {
  timestamp: number
  type: PowerUpType
  value: number
}

interface PixiMoneyJourneyGraphProps {
  dataPoints: DataPoint[]
  powerUpMarkers: PowerUpMarker[]
  maxValue: number
  startingValue: number
}

const ICON_MAP: Record<PowerUpType, typeof Lightning> = {
  multiplier: Lightning,
  turbo: Rocket,
  shield: ShieldCheck,
  mega: Star,
}

const COLOR_MAP: Record<PowerUpType, string> = {
  multiplier: '#FFD700',
  turbo: '#FF6B6B',
  shield: '#4ECDC4',
  mega: '#9B59B6',
}

export function PixiMoneyJourneyGraph({ 
  dataPoints, 
  powerUpMarkers, 
  maxValue,
  startingValue 
}: PixiMoneyJourneyGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<Application | null>(null)
  const graphicsRef = useRef<Graphics | null>(null)
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

      const graphics = new Graphics()
      app.stage.addChild(graphics)
      graphicsRef.current = graphics

      const handleResize = () => {
        if (appRef.current) {
          appRef.current.renderer.resize(window.innerWidth, window.innerHeight)
        }
      }

      window.addEventListener('resize', handleResize)

      const draw = () => {
        if (!mounted || !graphicsRef.current || !appRef.current) return

        const g = graphicsRef.current
        g.clear()

        if (dataPoints.length < 2) return

        const width = window.innerWidth
        const height = window.innerHeight
        const padding = 40

        const minTime = dataPoints[0].timestamp
        const maxTime = dataPoints[dataPoints.length - 1].timestamp
        const timeRange = maxTime - minTime || 1

        const valueRange = maxValue - 0

        const mapX = (timestamp: number) => {
          return padding + ((timestamp - minTime) / timeRange) * (width - padding * 2)
        }

        const mapY = (value: number) => {
          return height - padding - (value / valueRange) * (height - padding * 2)
        }

        g.moveTo(mapX(dataPoints[0].timestamp), mapY(dataPoints[0].value))

        for (let i = 1; i < dataPoints.length; i++) {
          g.lineTo(mapX(dataPoints[i].timestamp), mapY(dataPoints[i].value))
        }

        g.lineTo(mapX(dataPoints[dataPoints.length - 1].timestamp), height - padding)
        g.lineTo(mapX(dataPoints[0].timestamp), height - padding)
        g.closePath()

        g.fill({ color: 0x358555, alpha: 0.2 })

        g.moveTo(mapX(dataPoints[0].timestamp), mapY(dataPoints[0].value))

        for (let i = 1; i < dataPoints.length; i++) {
          g.lineTo(mapX(dataPoints[i].timestamp), mapY(dataPoints[i].value))
        }

        g.stroke({ width: 2, color: 0x358555, alpha: 0.8 })

        const startingY = mapY(startingValue)
        g.moveTo(padding, startingY)
        g.lineTo(width - padding, startingY)
        g.stroke({ width: 1, color: 0x358555, alpha: 0.3 })

        animationFrameRef.current = requestAnimationFrame(draw)
      }

      draw()

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
      if (graphicsRef.current) {
        graphicsRef.current.destroy()
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
      }
    }
  }, [dataPoints, maxValue, startingValue])

  const getMarkerPosition = (marker: PowerUpMarker) => {
    if (dataPoints.length < 2) return { x: 0, y: 0 }

    const minTime = dataPoints[0].timestamp
    const maxTime = dataPoints[dataPoints.length - 1].timestamp
    const timeRange = maxTime - minTime || 1

    const x = ((marker.timestamp - minTime) / timeRange) * 100
    const y = (1 - marker.value / maxValue) * 100

    return { x, y }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {powerUpMarkers.map((marker, index) => {
        const Icon = ICON_MAP[marker.type]
        const color = COLOR_MAP[marker.type]
        const position = getMarkerPosition(marker)

        return (
          <motion.div
            key={`${marker.timestamp}-${index}`}
            className="absolute pointer-events-none"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 500,
              damping: 25,
            }}
          >
            <div 
              className="relative"
              style={{
                filter: `drop-shadow(0 0 8px ${color})`,
              }}
            >
              <Icon 
                size={24} 
                weight="fill" 
                style={{ color }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
