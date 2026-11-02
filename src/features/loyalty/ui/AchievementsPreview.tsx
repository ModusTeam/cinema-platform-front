import AchievementCard from '../achievements/AchievementCard'
import { achievementDetailsPath } from '../achievements/achievementCollectionModel'
import type { AchievementsPreviewData } from '../achievements/achievements.types'

const AchievementsPreview = ({ data }: { data: AchievementsPreviewData }) => (
  <>
    <p className='mb-6 text-sm tabular-nums text-[var(--account-muted)]'>
      Відкрито {data.totalUnlocked} з {data.totalAvailable}
    </p>
    {data.items.length > 0 ? (
      <ul className='grid gap-x-8 md:grid-cols-3'>
        {data.items.map(item => (
          <li key={item.id} className='min-w-0'>
            <AchievementCard
              achievement={item}
              badgeSize='small'
              to={achievementDetailsPath(item.id)}
            />
          </li>
        ))}
      </ul>
    ) : (
      <p className='border-t border-[var(--account-rule)] py-6 text-sm text-[var(--account-muted)]'>
        Досягнень поки немає. Ваша колекція з’явиться тут, коли вони стануть
        доступними.
      </p>
    )}
  </>
)
export default AchievementsPreview
