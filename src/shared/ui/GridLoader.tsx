import { clsx } from 'clsx'
import { useId } from 'react'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'

interface GridLoaderProps {
  className?: string
  size?: number
  color?: string
}

export const GridLoader = ({
  className,
  size = 24,
  color = 'currentColor',
}: GridLoaderProps) => {
  const reducedMotion = useMotionPreference()
  const animationId = useId().replace(/:/g, '')
  if (reducedMotion) {
    return (
      <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill={color}
        className={clsx('block motion-reduce:animate-none', className)}
        role='img'
        aria-label='Завантаження'
      >
        {[1, 8.33, 15.66].flatMap(x =>
          [1, 8.33, 15.66].map(y => (
            <rect key={`${x}-${y}`} x={x} y={y} width={7.33} height={7.33} />
          )),
        )}
      </svg>
    )
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      className={clsx('block motion-reduce:animate-none', className)}
      role='img'
      aria-label='Завантаження'
    >
      <rect x='1' y='1' width='7.33' height='7.33'>
        <animate
          id={`${animationId}-start`}
          begin={`0;${animationId}-end.end+0.2s`}
          attributeName='x'
          dur='0.6s'
          values='1;4;1'
        />
        <animate
          begin={`0;${animationId}-end.end+0.2s`}
          attributeName='y'
          dur='0.6s'
          values='1;4;1'
        />
        <animate
          begin={`0;${animationId}-end.end+0.2s`}
          attributeName='width'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
        <animate
          begin={`0;${animationId}-end.end+0.2s`}
          attributeName='height'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
      </rect>
      <rect x='8.33' y='1' width='7.33' height='7.33'>
        <animate
          begin={`${animationId}-start.begin+0.1s`}
          attributeName='x'
          dur='0.6s'
          values='8.33;11.33;8.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.1s`}
          attributeName='y'
          dur='0.6s'
          values='1;4;1'
        />
        <animate
          begin={`${animationId}-start.begin+0.1s`}
          attributeName='width'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.1s`}
          attributeName='height'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
      </rect>
      <rect x='1' y='8.33' width='7.33' height='7.33'>
        <animate
          begin={`${animationId}-start.begin+0.1s`}
          attributeName='x'
          dur='0.6s'
          values='1;4;1'
        />
        <animate
          begin={`${animationId}-start.begin+0.1s`}
          attributeName='y'
          dur='0.6s'
          values='8.33;11.33;8.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.1s`}
          attributeName='width'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.1s`}
          attributeName='height'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
      </rect>
      <rect x='15.66' y='1' width='7.33' height='7.33'>
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='x'
          dur='0.6s'
          values='15.66;18.66;15.66'
        />
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='y'
          dur='0.6s'
          values='1;4;1'
        />
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='width'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='height'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
      </rect>
      <rect x='8.33' y='8.33' width='7.33' height='7.33'>
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='x'
          dur='0.6s'
          values='8.33;11.33;8.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='y'
          dur='0.6s'
          values='8.33;11.33;8.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='width'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='height'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
      </rect>
      <rect x='1' y='15.66' width='7.33' height='7.33'>
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='x'
          dur='0.6s'
          values='1;4;1'
        />
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='y'
          dur='0.6s'
          values='15.66;18.66;15.66'
        />
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='width'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.2s`}
          attributeName='height'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
      </rect>
      <rect x='15.66' y='8.33' width='7.33' height='7.33'>
        <animate
          begin={`${animationId}-start.begin+0.3s`}
          attributeName='x'
          dur='0.6s'
          values='15.66;18.66;15.66'
        />
        <animate
          begin={`${animationId}-start.begin+0.3s`}
          attributeName='y'
          dur='0.6s'
          values='8.33;11.33;8.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.3s`}
          attributeName='width'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.3s`}
          attributeName='height'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
      </rect>
      <rect x='8.33' y='15.66' width='7.33' height='7.33'>
        <animate
          begin={`${animationId}-start.begin+0.3s`}
          attributeName='x'
          dur='0.6s'
          values='8.33;11.33;8.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.3s`}
          attributeName='y'
          dur='0.6s'
          values='15.66;18.66;15.66'
        />
        <animate
          begin={`${animationId}-start.begin+0.3s`}
          attributeName='width'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.3s`}
          attributeName='height'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
      </rect>
      <rect x='15.66' y='15.66' width='7.33' height='7.33'>
        <animate
          id={`${animationId}-end`}
          begin={`${animationId}-start.begin+0.4s`}
          attributeName='x'
          dur='0.6s'
          values='15.66;18.66;15.66'
        />
        <animate
          begin={`${animationId}-start.begin+0.4s`}
          attributeName='y'
          dur='0.6s'
          values='15.66;18.66;15.66'
        />
        <animate
          begin={`${animationId}-start.begin+0.4s`}
          attributeName='width'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
        <animate
          begin={`${animationId}-start.begin+0.4s`}
          attributeName='height'
          dur='0.6s'
          values='7.33;1.33;7.33'
        />
      </rect>
    </svg>
  )
}
