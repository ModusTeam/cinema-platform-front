import { useState } from 'react'
import { cataloguePosterCopy } from '../config/cataloguePoster.copy'

interface CataloguePosterProps {
  src?: string
  title: string
}

export default function CataloguePoster({ src, title }: CataloguePosterProps) {
  const [failed, setFailed] = useState(false)
  const hasImage = src && !src.includes('placehold.co/') && !failed
  return (
    <div className='relative flex aspect-[2/3] items-center justify-center overflow-hidden bg-[var(--catalogue-image)]'>
      {hasImage ? (
        <img
          src={src}
          alt=''
          className='catalogue-poster h-full w-full object-contain'
          loading='lazy'
          decoding='async'
          onError={() => setFailed(true)}
        />
      ) : (
        <div className='flex h-full flex-col justify-between p-6 text-[var(--text-muted)]'>
          <span className='text-xs'>{cataloguePosterCopy.missing}</span>
          <span
            aria-hidden='true'
            className='catalogue-film-title line-clamp-4 text-center'
          >
            {title}
          </span>
          <span aria-hidden='true' className='block h-px w-12 bg-current' />
        </div>
      )}
    </div>
  )
}
