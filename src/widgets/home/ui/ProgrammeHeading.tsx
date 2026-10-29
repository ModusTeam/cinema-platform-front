import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'

const ProgrammeHeading = () => {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reducedMotion = useMotionPreference()
  const { scrollYProgress } = useScroll({
    target: headingRef,
    offset: ['start end', 'start 0.7'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [16, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [0.8, 1])

  return (
    <motion.h2
      ref={headingRef}
      style={reducedMotion ? undefined : { y, opacity }}
      className='home-programme-heading type-public-section text-[var(--text-main)]'
    >
      Зараз у кіно
    </motion.h2>
  )
}

export default ProgrammeHeading
