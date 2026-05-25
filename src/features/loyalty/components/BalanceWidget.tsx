interface BalanceWidgetProps {
  pointsBalance: number
}

const BalanceWidget = ({ pointsBalance }: BalanceWidgetProps) => {
  return (
    <div className='flex w-full flex-col gap-4 md:w-1/2'>
      <div className='flex flex-col gap-1'>
        <span className='text-sm tracking-widest text-neutral-500 uppercase'>
          Баланс
        </span>
        <div className='flex items-baseline gap-2'>
          <h2 className='text-3xl font-medium text-white'>{pointsBalance}</h2>
          <span className='text-sm text-neutral-500'>балів</span>
        </div>
      </div>
      <p className='text-sm leading-relaxed text-neutral-400'>
        Балами можна скористатися під час оформлення замовлення. Остаточну суму
        знижки розрахує система оплати.
      </p>
    </div>
  )
}

export default BalanceWidget
