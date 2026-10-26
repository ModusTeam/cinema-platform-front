import { Link } from 'react-router-dom'

export function ProgrammeBrand() {
  return (
    <Link
      to='/'
      aria-label='vespre. — головна'
      className='min-w-0 font-programme-display text-[2.375rem] leading-[1.1] font-extrabold tracking-[-0.03em] md:text-5xl'
    >
      vespre.
    </Link>
  )
}
