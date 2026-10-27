import { LoaderCircle } from 'lucide-react'

export default function CatalogueLoading({ label }: { label: string }) {
  return (
    <output className='flex min-h-80 flex-col items-center justify-center gap-4 text-[var(--text-muted)]'>
      <LoaderCircle
        aria-hidden='true'
        className='h-8 w-8 motion-safe:animate-spin'
      />
      <span>{label}</span>
    </output>
  )
}
