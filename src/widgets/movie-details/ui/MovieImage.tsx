import { useState } from 'react'

interface MovieImageProps {
  src?: string
  alt: string
  className?: string
  eager?: boolean
}

// The parent keys this by source so a failed image cannot hide the next film.
export default function MovieImage({
  src,
  alt,
  className,
  eager,
}: MovieImageProps) {
  const [failed, setFailed] = useState(false)
  if (!src || failed || src.includes('placehold.co/')) return null

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding='async'
      onError={() => setFailed(true)}
    />
  )
}
