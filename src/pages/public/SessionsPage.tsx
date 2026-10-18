import MoviesGrid from '@/widgets/movies-grid/ui/MoviesGrid'

const SessionsPage = () => {
  return (
    <div className='min-h-screen bg-[var(--bg-main)] py-12'>
      <div className='container mx-auto px-4'>
        <div className='mb-8 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col md:flex-row md:items-end justify-between gap-4'>
          <div>
            <h1 className='text-4xl font-black text-white uppercase tracking-tighter'>
              Афіша{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-orange-500'>
                Кінотеатру
              </span>
            </h1>
            <p className='mt-2 text-lg text-[var(--text-muted)] max-w-xl'>
              Розклад сеансів, прем'єри та бронювання квитків.
            </p>
          </div>
        </div>

        <div className='animate-in fade-in slide-in-from-bottom-8 duration-700'>
          <MoviesGrid />
        </div>
      </div>
    </div>
  )
}

export default SessionsPage
