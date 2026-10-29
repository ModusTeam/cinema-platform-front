import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@/shared/ui/Button'

interface AdminPaginationProps {
  pageNumber: number
  pageSize: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  onPageChange: (page: number) => void
}

export const AdminPagination = ({
  pageNumber,
  pageSize,
  totalCount,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: AdminPaginationProps) => (
  <nav
    aria-label='Сторінки результатів'
    className='flex flex-wrap items-center justify-between gap-4 text-sm tabular-nums text-[var(--text-muted)]'
  >
    <p aria-live='polite'>
      {totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1}–
      {Math.min(pageNumber * pageSize, totalCount)} з {totalCount}
    </p>
    <div className='flex items-center gap-2'>
      <Button
        variant='ghost'
        className='w-11 px-0'
        aria-label='Попередня сторінка'
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        <ChevronLeft size={18} aria-hidden='true' />
      </Button>
      <span className='px-2'>Сторінка {pageNumber}</span>
      <Button
        variant='ghost'
        className='w-11 px-0'
        aria-label='Наступна сторінка'
        disabled={!hasNextPage}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        <ChevronRight size={18} aria-hidden='true' />
      </Button>
    </div>
  </nav>
)
