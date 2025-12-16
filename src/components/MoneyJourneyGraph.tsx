import { useEffect, useRef } from 'react'
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

interface MoneyJourneyGraphProps {
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

export function MoneyJourneyGraph({ 
  dataPoints, 
  powerUpMarkers, 
  maxValue,
  startingValue 
}: MoneyJourneyGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      ctx.scale(dpr, dpr)
      return rect
    }

    let rect = updateCanvasSize()

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height)

      if (dataPoints.length < 2) return

      const padding = 40
      const width = rect.width - padding * 2
      const height = rect.height - padding * 2

      const minTime = dataPoints[0].timestamp
      const maxTime = dataPoints[dataPoints.length - 1].timestamp
      const timeRange = maxTime - minTime || 1

      const valueRange = maxValue - 0

      const mapX = (timestamp: number) => {
        return padding + ((timestamp - minTime) / timeRange) * width
      }

      const mapY = (value: number) => {
        return rect.height - padding - (value / valueRange) * height
      }

      ctx.beginPath()
      ctx.moveTo(mapX(dataPoints[0].timestamp), mapY(dataPoints[0].value))

      for (let i = 1; i < dataPoints.length; i++) {
        ctx.lineTo(mapX(dataPoints[i].timestamp), mapY(dataPoints[i].value))
      }

      ctx.lineTo(mapX(dataPoints[dataPoints.length - 1].timestamp), rect.height - padding)
      ctx.lineTo(mapX(dataPoints[0].timestamp), rect.height - padding)
      ctx.closePath()

      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
      gradient.addColorStop(0, 'rgba(53, 135, 85, 0.3)')
      gradient.addColorStop(1, 'rgba(53, 135, 85, 0.05)')

      ctx.fillStyle = gradient
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(mapX(dataPoints[0].timestamp), mapY(dataPoints[0].value))

      for (let i = 1; i < dataPoints.length; i++) {
        ctx.lineTo(mapX(dataPoints[i].timestamp), mapY(dataPoints[i].value))
      }

      ctx.strokeStyle = 'rgba(53, 135, 85, 0.8)'
      ctx.lineWidth = 2
      ctx.stroke()

      const startingY = mapY(startingValue)
      ctx.beginPath()
      ctx.setLineDash([5, 5])
      ctx.moveTo(padding, startingY)
      ctx.lineTo(rect.width - padding, startingY)
      ctx.strokeStyle = 'rgba(53, 135, 85, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.setLineDash([])
    }

    const animate = () => {
      draw()
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      rect = updateCanvasSize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', handleResize)
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
