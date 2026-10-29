import { Link } from 'react-router-dom'
import { getAccountSection } from '@/features/profile/config/accountNavigation'
import { useProfile } from '@/features/profile/model/useProfile'
import AccountAchievements from '@/features/profile/ui/AccountAchievements'
import AccountLoyaltySummary from '@/features/profile/ui/AccountLoyaltySummary'
import AccountNavigation from '@/features/profile/ui/AccountNavigation'
import AccountOrders from '@/features/profile/ui/AccountOrders'
import AccountSettings from '@/features/profile/ui/AccountSettings'
import UnavailableState from '@/shared/ui/UnavailableState'
import '@/features/profile/ui/account.css'

export default function ProfilePage() {
  const profile = useProfile()
  const { user, activeTab, setActiveTab } = profile
  if (!user) return null
  const section = getAccountSection(activeTab)
  return (
    <div className='account font-public'>
      <div className='mx-auto max-w-[1440px] px-5 pb-20 pt-9 sm:px-8 lg:px-12 lg:pt-14'>
        <p className='mb-7 text-sm text-[var(--account-muted)]'>
          Особистий кабінет
        </p>
        <div className='account-layout grid gap-9 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2.15fr)] lg:gap-x-16 xl:gap-x-24'>
          <aside className='account-navigation-area min-w-0'>
            <p className='mb-6 text-base leading-relaxed lg:mb-9'>
              {user.name} {user.surname}
            </p>
            <AccountNavigation active={activeTab} onChange={setActiveTab} />
          </aside>
          <section
            id='account-content'
            aria-labelledby='account-heading'
            className='account-content-area min-w-0'
          >
            <header className='mb-9 border-b border-[var(--account-rule)] pb-7'>
              <h1 id='account-heading' className='account-heading'>
                {section.label}
              </h1>
              <p className='mt-4 text-sm leading-relaxed text-[var(--account-muted)] sm:text-base'>
                {section.description}
              </p>
            </header>
            {activeTab === 'active-tickets' || activeTab === 'history' ? (
              <AccountOrders
                orders={
                  activeTab === 'history'
                    ? profile.historyOrders
                    : profile.activeTickets
                }
                history={activeTab === 'history'}
                loading={profile.isLoadingTickets}
                error={profile.isTicketsError}
                onRetry={() => void profile.refetchTickets()}
              />
            ) : activeTab === 'achievements' ? (
              <AccountAchievements />
            ) : null}
            <div hidden={activeTab !== 'settings'}>
              {profile.isLoadingProfile ? (
                <output>Завантажуємо профіль…</output>
              ) : profile.isProfileError ? (
                <UnavailableState
                  className='account-state'
                  onRetry={() => void profile.refetchProfile()}
                />
              ) : (
                <AccountSettings
                  user={user}
                  saving={profile.isSaving}
                  savingDateOfBirth={profile.isSavingDateOfBirth}
                  onSave={profile.updateProfileData}
                  onSaveDateOfBirth={profile.setDateOfBirth}
                />
              )}
            </div>
          </section>
          <aside className='account-summary-area min-w-0 lg:max-w-72'>
            <AccountLoyaltySummary />
            <div className='mt-6 flex flex-wrap justify-between gap-3 lg:grid'>
              {user.role === 'admin' && (
                <Link to='/admin' className='account-link py-3 text-sm'>
                  Адмін-панель ↗
                </Link>
              )}
              <button
                type='button'
                onClick={profile.logout}
                className='account-link min-h-11 w-fit text-left text-sm'
              >
                Вийти з акаунту
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
