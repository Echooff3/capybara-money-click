import { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  isIncreasing: boolean
  isDecreasing: boolean
}

export function AnimatedCounter({ value, isIncreasing, isDecreasing }: AnimatedCounterProps) {
  const springValue = useSpring(value, {
    stiffness: 100,
    damping: 20,
    mass: 1,
  })

  const prevValue = useRef(value)

  useEffect(() => {
    if (value !== prevValue.current) {
      springValue.set(value)
      prevValue.current = value
    }
  }, [value, springValue])

  const display = useTransform(springValue, (latest) => {
    return `$${Math.round(latest).toLocaleString()}`
  })

  const colorClass = isIncreasing
    ? 'text-accent'
    : isDecreasing
    ? 'text-destructive'
    : 'text-primary'

  return (
    <motion.div
      className={`font-display text-5xl sm:text-6xl md:text-7xl font-bold text-center ${colorClass} text-glow transition-colors duration-300`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <motion.span>{display}</motion.span>
    </motion.div>
  )
}
