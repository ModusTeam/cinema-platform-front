// Temporary Phase 2 comparison helper. Invoke through Playwright browser_run_code.
// Uses the existing type-checked lab MovieDto; never imported by production.
async (page, { stage, outputDir, baseUrl = 'http://127.0.0.1:5174' }) => {
  const browser = page.context().browser()
  const context = await browser.newContext({
    locale: 'uk-UA', timezoneId: 'Europe/Kyiv', reducedMotion: 'reduce',
  })
  const p = await context.newPage()
  await p.clock.setFixedTime(new Date('2026-10-26T09:00:00Z'))
  await p.goto(`${baseUrl}/docs/design/ui-experience-polish/lab/index.html`)
  const fixture = await p.evaluate(async () => {
    const f = await import('/src/app/design-lab/fixtures.ts')
    return { movie: f.movieFixture, longTitle: f.longTitle }
  })
  const movies = [fixture.movie, {
    ...fixture.movie, id: 'film-long', title: fixture.longTitle,
  }, { ...fixture.movie, id: 'film-soon', status: 1 }]
  const sessions = movies.slice(0, 2).flatMap(movie => [16, 19, 21].map((hour, i) => ({
    id: `${movie.id}-session-${i}`, movieId: movie.id, movieTitle: movie.title,
    hallId: 'hall', hallName: 'Зал 1', status: 'Scheduled', price: 250,
    startTime: `2026-10-26T${hour - 2}:30:00Z`, endTime: `2026-10-26T${hour}:49:00Z`,
  })))
  const paginated = items => ({ items, pageNumber: 1, totalPages: 1, totalCount: items.length })
  let state = 'ready'
  const errors = [], mutations = [], results = []
  p.on('pageerror', error => errors.push(error.message))
  p.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url())
    if (request.isNavigationRequest()) return route.continue()
    if (['xhr', 'fetch'].includes(request.resourceType()) && !url.pathname.startsWith('/src/')) {
      if (request.method() !== 'GET') { mutations.push(url.pathname); return route.abort() }
      if (state === 'loading') await new Promise(resolve => setTimeout(resolve, 1500))
      const headers = { 'Access-Control-Allow-Origin': '*' }
      if (url.pathname.endsWith('/movies')) return route.fulfill({ json: paginated(state === 'empty' ? [] : movies), headers })
      if (url.pathname.endsWith('/sessions')) return route.fulfill({ json: paginated(sessions), headers })
      if (url.pathname.endsWith('/halls')) return route.fulfill({ json: paginated([{ id: 'hall', name: 'Зал 1', capacity: 80, totalCapacity: 80, technologies: [{ id: 'atmos', name: 'Dolby Atmos' }] }]), headers })
      return route.fulfill({ json: [], headers })
    }
    if (url.origin !== baseUrl) return route.fulfill({ status: 204 })
    return route.continue()
  })
  const capture = async name => p.screenshot({ path: `${outputDir}/${stage}-${name}.png`, fullPage: true })
  try {
    for (const width of [1440, 768, 390, 320]) {
      await p.setViewportSize({ width, height: width > 1000 ? 1000 : 844 })
      for (const path of ['/', '/sessions']) {
        await p.goto(baseUrl + path, { waitUntil: 'networkidle' })
        await p.locator('h1').waitFor()
        await p.evaluate(() => document.fonts.ready)
        await capture(`${path === '/' ? 'home' : 'sessions'}-${width}`)
        results.push({ path, width, heading: await p.locator('h1').innerText(), ...await p.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          overlay: !!document.querySelector('vite-error-overlay'),
          font: getComputedStyle(document.querySelector('h1')).fontFamily,
        })) })
      }
    }
    await p.getByRole('button', { name: 'Скоро', exact: true }).click()
    await capture('card-coming-soon-320')
    results.push({ soonPressed: await p.getByRole('button', { name: 'Скоро', exact: true }).getAttribute('aria-pressed') })
    await p.getByRole('button', { name: 'Розклад', exact: true }).click()
    const dates = p.locator('button.selection-control').filter({ has: p.locator('span.text-xl') })
    await dates.nth(1).click()
    await p.getByText('Немає сеансів на цю дату').waitFor()
    await capture('sessions-empty-320')
    await p.getByRole('button', { name: 'Повернутися на сьогодні' }).click()
    const session = p.locator('a[href^="/booking/"]').first()
    await session.focus()
    await p.keyboard.press('Shift+Tab')
    await p.keyboard.press('Tab')
    results.push({ sessionFocus: await session.evaluate(el => ({ focused: el === document.activeElement, outline: getComputedStyle(el).outlineWidth, height: el.getBoundingClientRect().height })) })
    await capture('card-focus-320')
    state = 'empty'
    await p.goto(baseUrl, { waitUntil: 'networkidle' })
    await p.getByText('Афіша скоро поповниться').waitFor()
    await capture('home-empty-320')
    state = 'loading'
    await p.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    await p.locator('main .animate-spin').first().waitFor()
    await capture('home-loading-320')
    await p.goto(baseUrl + '/sessions', { waitUntil: 'domcontentloaded' })
    await p.locator('main .animate-spin').first().waitFor()
    await capture('sessions-loading-320')
    return { stage, results, errors, mutations, note: 'Fixture reads only; no live backend or payment flow.' }
  } finally { await context.close() }
}
