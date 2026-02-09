'use client'

import { useEffect, useRef, useState } from 'react'

export default function SmoothCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorBorderRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>(0)

  const mousePosition = useRef({ x: -100, y: -100 })
  const dotPosition = useRef({ x: -100, y: -100 })
  const borderPosition = useRef({ x: -100, y: -100 })

  const [isHovering, setIsHovering] = useState(false)

  const DOT_SMOOTHNESS = 1
  const BORDER_SMOOTHNESS = 0.15

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY }

      if (dotPosition.current.x === -100) {
        dotPosition.current = { x: e.clientX, y: e.clientY }
        borderPosition.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (target.closest('.cursor-auto') || target.tagName === 'IFRAME') {
        setIsHovering(false)
        return
      }

      const isInteractive =
        target.closest('a') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('.cursor-pointer') ||
        target.closest('[role="button"]')

      setIsHovering(!!isInteractive)
    }

    const handleMouseOut = () => {
      setIsHovering(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    const animate = () => {
      const lerp = (start: number, end: number, factor: number) => {
        return start + (end - start) * factor
      }

      dotPosition.current.x = lerp(
        dotPosition.current.x,
        mousePosition.current.x,
        DOT_SMOOTHNESS,
      )
      dotPosition.current.y = lerp(
        dotPosition.current.y,
        mousePosition.current.y,
        DOT_SMOOTHNESS,
      )

      borderPosition.current.x = lerp(
        borderPosition.current.x,
        mousePosition.current.x,
        BORDER_SMOOTHNESS,
      )
      borderPosition.current.y = lerp(
        borderPosition.current.y,
        mousePosition.current.y,
        BORDER_SMOOTHNESS,
      )

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${dotPosition.current.x}px, ${dotPosition.current.y}px, 0) translate(-50%, -50%)`
      }

      if (cursorBorderRef.current) {
        cursorBorderRef.current.style.transform = `translate3d(${borderPosition.current.x}px, ${borderPosition.current.y}px, 0) translate(-50%, -50%)`
      }

      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      cancelAnimationFrame(requestRef.current)
    }
  }, [])

  return (
    <div className='pointer-events-none fixed inset-0 z-[9999] hidden lg:block mix-blend-difference'>
      <div
        ref={cursorDotRef}
        className='absolute top-0 left-0 w-2 h-2 bg-white rounded-full will-change-transform'
      />

      <div
        ref={cursorBorderRef}
        className={`absolute top-0 left-0 rounded-full border border-white will-change-[transform,width,height] transition-[width,height] duration-300 ease-out ${
          isHovering ? 'w-12 h-12 bg-white/20' : 'w-8 h-8'
        }`}
      />
    </div>
  )
}
