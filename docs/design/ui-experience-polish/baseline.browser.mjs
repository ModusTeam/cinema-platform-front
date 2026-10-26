// Unmodified production entry, disposable context and intercepted READ requests.
async (page, { outputDir, baseUrl = 'http://127.0.0.1:5174' } = {}) => {
  if (!outputDir) throw new Error('Provide an existing absolute outputDir')
  const context = await page.context().browser().newContext({
    locale: 'uk-UA', timezoneId: 'Europe/Kyiv', reducedMotion: 'reduce',
  })
  const specimen = await context.newPage()
  const errors = []
  const readRequests = []
  const mutationRequests = []
  const candidateFonts = []
  specimen.on('pageerror', e => errors.push(e.message))
  specimen.on('request', request => {
    if (/unbounded|onest|roboto-condensed|golos-text/.test(request.url())) candidateFonts.push(request.url())
  })
  const movieId = '750828f9-c778-44f4-b010-7416abe6aa01'
  const hallId = '750828f9-c778-44f4-b010-7416abe6aa09'
  const movie = {
    id: movieId, title: 'Бійцівський клуб',
    description: 'Культова історія про пошук себе. Поверніться до фільму Девіда Фінчера на великому екрані.',
    durationMinutes: 139, rating: 8.8, releaseYear: 1999,
    posterUrl: '/placeholder-wip.jpg', backdropUrl: '/placeholder-wip.jpg',
    trailerUrl: null, genres: ['Драма', 'Трилер'], cast: [], status: 2,
  }
  const paginated = items => ({ items, pageNumber: 1, totalPages: 1, totalCount: items.length, hasPreviousPage: false, hasNextPage: false })
  const sessions = [16, 19, 21].map((hour, index) => ({
    id: `750828f9-c778-44f4-b010-7416abe6aa0${index + 2}`,
    movieId, movieTitle: movie.title, hallId, hallName: 'Зал 1',
    startTime: `2026-10-26T${String(hour - 2).padStart(2, '0')}:30:00Z`,
    endTime: `2026-10-26T${String(hour).padStart(2, '0')}:49:00Z`,
    status: 'Scheduled', price: 250,
  }))
  await specimen.route('**/*', route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin === baseUrl && request.isNavigationRequest()) return route.continue()
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      mutationRequests.push(request.method() + ' ' + url.pathname)
      return route.abort()
    }
    const headers = { 'Access-Control-Allow-Origin': '*' }
    if (url.pathname.endsWith('/movies')) {
      readRequests.push(url.pathname)
      return route.fulfill({ json: paginated([movie]), headers })
    }
    if (url.pathname.endsWith(`/movies/${movieId}`)) return route.fulfill({ json: movie, headers })
    if (url.pathname.endsWith('/sessions')) return route.fulfill({ json: paginated(sessions), headers })
    if (url.pathname.endsWith('/halls')) return route.fulfill({ json: paginated([{id: hallId, name: 'Зал 1', capacity: 80, totalCapacity: 80, technologies: [{id: 'atmos', name: 'Dolby Atmos'}]}]), headers })
    if (url.hostname === 'grainy-gradients.vercel.app' || url.hostname === 'www.transparenttextures.com') {
      return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>' })
    }
    if (url.origin === baseUrl) return route.continue()
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    return route.abort()
  })
  await specimen.clock.setFixedTime(new Date('2026-10-26T09:00:00Z'))
  const results = []
  try {
    for (const width of [1440, 390]) {
      await specimen.setViewportSize({width, height: width === 1440 ? 1000 : 844})
      for (const path of ['/', '/sessions', `/movies/${movieId}`]) {
        await specimen.goto(`${baseUrl}${path}`, {waitUntil: 'networkidle'})
        await specimen.locator('h1').waitFor()
        await specimen.evaluate(() => document.fonts.ready)
        await specimen.evaluate(() => {
          const badge = document.createElement('div')
          badge.textContent = 'MOCK DATA / поточний production UI / API перехоплено Playwright'
          badge.setAttribute('style', 'position:fixed;bottom:0;left:0;right:0;padding:8px;background:#222226;color:white;font:12px sans-serif;z-index:999;pointer-events:none')
          document.body.append(badge)
        })
        const name = path === '/' ? 'home' : path === '/sessions' ? 'sessions' : 'details'
        await specimen.screenshot({path:`${outputDir}/fixture-production-${name}-${width}.png`,fullPage:true})
        results.push({width,path,heading:await specimen.locator('h1').first().innerText(),overflow:await specimen.evaluate(()=>document.documentElement.scrollWidth>innerWidth),font:await specimen.locator('body').evaluate(e=>getComputedStyle(e).fontFamily)})
      }
    }
    if (candidateFonts.length || mutationRequests.length || errors.length) throw new Error(JSON.stringify({candidateFonts,mutationRequests,errors}))
    return {results,readRequests,candidateFonts,mutationRequests,errors,note:'Read-only production-entry smoke with fixtures. Grain/texture intercepted; no real backend, auth, checkout or admin flow tested.'}
  } finally { await context.close() }
}
