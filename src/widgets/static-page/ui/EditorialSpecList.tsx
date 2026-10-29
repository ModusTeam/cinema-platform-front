interface EditorialSpecListProps {
  items: readonly { label: string; value: string }[]
}

export default function EditorialSpecList({ items }: EditorialSpecListProps) {
  return (
    <dl className='divide-y divide-[var(--editorial-rule)] border-y border-[var(--editorial-rule)]'>
      {items.map(item => (
        <div
          key={item.label}
          className='grid grid-cols-2 items-baseline gap-4 py-4'
        >
          <dt className='text-sm text-[var(--text-muted)]'>{item.label}</dt>
          <dd className='text-right text-lg tabular-nums'>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
