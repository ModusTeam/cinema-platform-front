import { type ComponentType, lazy, Suspense } from 'react'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'

const NativeScroll = () => null
const SmoothDocumentScroll = lazy<ComponentType>(() =>
  import('./SmoothDocumentScroll').catch(() => ({ default: NativeScroll })),
)

// An optional enhancement: content stays visible while loading or after failure.
// The Home route owns the instance; reduced motion also unmounts its resources.
const HomeScroll = () => {
  const reducedMotion = useMotionPreference()
  if (reducedMotion) return null
  return (
    <Suspense fallback={null}>
      <SmoothDocumentScroll />
    </Suspense>
  )
}

export default HomeScroll
