import type { ReactNode } from 'react'
import EditorialPageLayout from './EditorialPageLayout'

interface StaticPageLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

const StaticPageLayout = ({
  title,
  subtitle,
  children,
}: StaticPageLayoutProps) => (
  <EditorialPageLayout title={title} subtitle={subtitle} surface='paper'>
    <article aria-label={title} className='editorial-document pt-10 md:pt-16'>
      {children}
    </article>
  </EditorialPageLayout>
)

export default StaticPageLayout
