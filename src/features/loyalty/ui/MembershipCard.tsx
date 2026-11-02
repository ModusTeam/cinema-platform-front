import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatLoyaltyDate } from '../lib/loyaltyDate'
import type { LoyaltyProfile } from '../model/loyalty.types'

export default function MembershipCard({
  profile,
}: {
  profile: LoyaltyProfile
}) {
  const expires = formatLoyaltyDate(profile.balanceExpiresAt)
  return (
    <section
      aria-labelledby='membership-heading'
      data-tier={profile.tier.id}
      className='membership-card min-w-0 self-start bg-[var(--bg-main)] px-6 pt-6 text-[var(--text-main)] sm:px-8 sm:pt-8'
    >
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-default)] pb-5'>
        <span className='font-sans text-2xl font-black uppercase tracking-tighter'>
          Cine<span className='text-[var(--color-primary)]'>ma</span>.
        </span>
        <h2
          id='membership-heading'
          className='text-sm text-[var(--text-muted)]'
        >
          Картка учасника
        </h2>
      </div>
      <dl>
        <div className='py-7 sm:py-9'>
          <dt className='text-sm text-[var(--text-muted)]'>Поточний рівень</dt>
          <dd className='membership-tier mt-2 font-[family-name:var(--font-public-display)] text-5xl leading-tight sm:text-6xl'>
            {profile.tier.label}
          </dd>
        </div>
        <div className='border-t border-[var(--border-default)] pb-6 pt-5'>
          <dt className='text-sm text-[var(--text-muted)]'>Доступні бали</dt>
          <dd className='mt-2 text-4xl font-medium leading-tight tabular-nums sm:text-5xl'>
            {profile.pointsBalance.toLocaleString('uk-UA')}
          </dd>
        </div>
      </dl>
      {expires && (
        <p className='pb-6 text-sm leading-relaxed text-[var(--text-muted)]'>
          Термін дії балів:{' '}
          <time dateTime={profile.balanceExpiresAt ?? undefined}>
            {expires}
          </time>
        </p>
      )}
      <Link
        to='/account/loyalty/history'
        className='membership-history flex min-h-14 items-center justify-between gap-4 border-t border-dashed border-[var(--border-default)] py-4 text-sm underline underline-offset-4'
      >
        Історія балів{' '}
        <ArrowRight size={18} className='shrink-0' aria-hidden='true' />
      </Link>
    </section>
  )
}
