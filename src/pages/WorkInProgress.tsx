const WorkInProgress = () => (
  <main className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-[url('/placeholder-wip.jpg')] bg-cover bg-center px-6">
    <style>{'body::before { content: none; }'}</style>
    <div className='absolute inset-0 bg-black/45' aria-hidden='true' />
    <h1 className='relative max-w-3xl text-center text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl'>
      Devs are working to deploy the best product.
    </h1>
  </main>
)

export default WorkInProgress
