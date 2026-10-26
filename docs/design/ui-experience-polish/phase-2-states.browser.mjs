// Temporary fixture-driven regression review, not part of production or Bun tests.
async (page, { outputDir, baseUrl = 'http://127.0.0.1:5174' }) => {
  const context = await page.context().browser().newContext({
    locale: 'uk-UA', timezoneId: 'Europe/Kyiv', reducedMotion: 'reduce',
  })
  const p = await context.newPage()
  const errors = [], mutations = [], results = []
  const check = (condition, message) => {
    if (!condition) throw new Error(message)
    results.push(message)
  }
  await p.clock.setFixedTime(new Date('2026-10-26T09:00:00Z'))
  await p.goto(`${baseUrl}/docs/design/ui-experience-polish/lab/index.html?variant=c`)
  const fixture = await p.evaluate(async () => {
    const f = await import('/src/app/design-lab/fixtures.ts')
    return { movie: f.movieFixture, longTitle: f.longTitle, glyphs: f.glyphSample }
  })
  const movies = [fixture.movie, { ...fixture.movie, id: 'long', title: fixture.longTitle }]
  const sessions = [16, 19, 21].map((hour, i) => ({
    id: `session-${i}`, movieId: fixture.movie.id, movieTitle: fixture.movie.title,
    hallId: 'hall', hallName: 'Зал 1', status: 'Scheduled', price: 250,
    startTime: `2026-10-26T${hour - 2}:30:00Z`, endTime: `2026-10-26T${hour}:49:00Z`,
  }))
  const paginated = items => ({ items, pageNumber: 1, totalPages: 1, totalCount: items.length })
  p.on('pageerror', error => errors.push(error.message))
  p.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await context.addInitScript(() => {
    const payload = btoa(JSON.stringify({ sub: 'phase-two-user', role: 'admin', firstName: 'QA', lastName: 'Reviewer', email: 'fixture@example.com', exp: 4102444800 }))
    localStorage.setItem('cinema_access_token', `e30.${payload}.fixture`)
  })
  await context.route('**/*', route => {
    const r = route.request(), url = new URL(r.url())
    if (r.isNavigationRequest()) return route.continue()
    if (['xhr', 'fetch'].includes(r.resourceType()) && !url.pathname.startsWith('/src/')) {
      if (r.method() !== 'GET') { mutations.push(url.pathname); return route.abort() }
      const headers = { 'Access-Control-Allow-Origin': '*' }
      const send = json => route.fulfill({ json, headers })
      if (url.pathname.endsWith('/account/profile')) return send({ id: 'phase-two-user', email: 'fixture@example.com', firstName: 'QA', lastName: 'Reviewer', loyaltyPoints: 125, loyaltyTier: 'Bronze', dateOfBirth: '1994-08-24' })
      if (url.pathname.endsWith('/account/loyalty')) return send({ points: 125, tier: 'Bronze', yearPoints: 125, yearVisits: 1 })
      if (url.pathname.endsWith('/orders')) return send({ activeOrders: [], pastOrders: [] })
      if (url.pathname.endsWith('/movies')) return send(paginated(movies))
      if (url.pathname.endsWith(`/movies/${fixture.movie.id}`)) return send(fixture.movie)
      if (url.pathname.endsWith('/sessions')) return send(paginated(sessions))
      if (url.pathname.endsWith('/halls')) return send(paginated([{ id: 'hall', name: 'Зал 1', capacity: 80, technologies: [] }]))
      return send([])
    }
    if (url.origin !== baseUrl) return route.fulfill({ status: 204 })
    return route.continue()
  })
  const capture = async name => {
    await p.evaluate(() => scrollTo(0, 0))
    return p.screenshot({ path: `${outputDir}/after-${name}.png`, fullPage: true })
  }
  const health = async label => {
    check(await p.title() === 'Cinema Platform', `${label}: correct app`)
    check(await p.locator('body').innerText().then(t => t.length > 100), `${label}: meaningful content`)
    check(await p.locator('vite-error-overlay').count() === 0, `${label}: no framework overlay`)
    check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: no page overflow`)
  }
  try {
    for (const width of [1440, 768, 390, 320]) {
      await p.setViewportSize({ width, height: width > 1000 ? 1000 : 844 })
      await p.goto(baseUrl, { waitUntil: 'networkidle' })
      await p.getByRole('button', { name: new RegExp(fixture.longTitle) }).filter({ visible: true }).click()
      check(await p.locator('h1').innerText() === fixture.longTitle, `Long Ukrainian hero selection at ${width}`)
      await health(`Long Home ${width}`)
      await capture(`home-long-${width}`)
      await p.goto(baseUrl + '/profile', { waitUntil: 'networkidle' })
      await p.getByRole('button', { name: 'Профіль', exact: true }).click()
      await p.getByLabel('Email', { exact: true }).waitFor()
      check(await p.getByLabel('Email', { exact: true }).isDisabled(), `Profile email remains disabled at ${width}`)
      await health(`Profile ${width}`)
      await capture(`profile-${width}`)
      check((await p.locator('h1').evaluate(el => getComputedStyle(el).fontFamily)).includes('Montserrat'), `Profile keeps Montserrat at ${width}`)
      await p.goto(`${baseUrl}/booking/${fixture.movie.id}`, { waitUntil: 'networkidle' })
      await p.locator('.selection-control').first().waitFor()
      await health(`Booking session choice ${width}`)
      await capture(`booking-session-${width}`)
    }
    for (const width of [1440, 768]) {
      await p.setViewportSize({ width, height: 1000 })
      await p.goto(baseUrl + '/admin/movies', { waitUntil: 'networkidle' })
      const edit = p.getByRole('button', { name: `Редагувати фільм «${fixture.movie.title}»` })
      await edit.click()
      const dialog = p.getByRole('dialog')
      await dialog.waitFor()
      check(await p.getByLabel('Опис', { exact: true }).count() === 1, `Admin field association at ${width}`)
      await health(`Admin edit ${width}`)
      await capture(`admin-edit-${width}`)
      await p.keyboard.press('Escape')
      check(await edit.evaluate(el => el === document.activeElement), `Admin dialog restores focus at ${width}`)
    }
    // Mount actual shared components with production CSS, outside lab overrides.
    await p.goto(baseUrl + '/sessions', { waitUntil: 'networkidle' })
    await p.evaluate(async glyphs => {
      const { createElement: h } = (await import('/node_modules/.vite/deps/react.js')).default
      const { createRoot } = (await import('/node_modules/.vite/deps/react-dom_client.js')).default
      const { default: Button } = await import('/src/shared/ui/Button.tsx')
      const { default: Input } = await import('/src/shared/ui/Input.tsx')
      document.getElementById('root').hidden = true
      const root = document.createElement('main')
      root.id = 'production-specimens'
      root.style.cssText = 'max-width:960px;margin:auto;padding:24px'
      root.className = 'font-public'
      document.body.append(root)
      createRoot(root, { identifierPrefix: 'qa-' }).render(h('div', { className: 'space-y-6' },
        h('h1', { className: 'type-public-display' }, 'Production UI / fixtures'),
        h('p', { id: 'display-glyphs', className: 'type-public-title' }, glyphs),
        h('p', { id: 'body-glyphs' }, glyphs),
        h('div', { className: 'flex flex-wrap gap-3' }, ...['primary','secondary','ghost','destructive','success'].map(variant => h(Button, { key: variant, variant }, variant))),
        h('div', { className: 'flex flex-wrap gap-3' }, h(Button, { disabled: true }, 'Недоступно'), h(Button, { isLoading: true }, 'Завантаження')),
        h(Input, { label: 'Ім’я', defaultValue: 'Євгенія Ґалаґан', hint: 'Українська типографіка' }),
        h(Input, { label: 'Email', disabled: true, defaultValue: 'fixture@example.com' }),
        h(Input, { label: 'Помилка', error: 'Перевірте адресу електронної пошти.' }),
        h('div', { className: 'flex flex-wrap gap-3' }, h('button', { type: 'button', className: 'selection-control px-4 py-2', 'aria-pressed': true }, 'Обрано'), h('button', { type: 'button', className: 'selection-control px-4 py-2', disabled: true, 'aria-pressed': true }, 'Недоступний сеанс')),
      ))
    }, fixture.glyphs)
    await p.getByLabel('Ім’я', { exact: true }).waitFor()
    const states = []
    for (const width of [1440, 768, 390, 320]) {
      await p.setViewportSize({ width, height: 1000 })
      await p.getByLabel('Ім’я', { exact: true }).focus()
      await p.keyboard.press('Shift+Tab')
      await p.keyboard.press('Tab')
      await p.getByLabel('Ім’я', { exact: true }).fill('Її п’ять: Ґґ 250 ₴')
      states.push(await p.getByLabel('Ім’я', { exact: true }).evaluate(el => ({ width: innerWidth, fontSize: getComputedStyle(el).fontSize, outline: getComputedStyle(el).outlineWidth })))
      check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Shared control fit at ${width}`)
      await capture(`shared-controls-${width}`)
    }
    const cdp = await context.newCDPSession(p)
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable')
    const { root } = await cdp.send('DOM.getDocument')
    const fonts = {}
    for (const selector of ['#display-glyphs', '#body-glyphs']) {
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector })
      fonts[selector] = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })).fonts
    }
    check(fonts['#display-glyphs'].every(f => f.isCustomFont), 'Display glyphs use self-hosted font fallback')
    check(fonts['#body-glyphs'].every(f => f.isCustomFont), 'Interface glyphs use self-hosted Golos Text')
    await p.setViewportSize({ width: 1440, height: 1000 })
    const primary = p.getByRole('button', { name: 'primary', exact: true })
    const defaultFill = await primary.evaluate(el => getComputedStyle(el).backgroundColor)
    await primary.hover()
    await p.waitForTimeout(180)
    const hoverFill = await primary.evaluate(el => getComputedStyle(el).backgroundColor)
    check(defaultFill !== hoverFill, 'Primary hover changes visibly')
    await primary.focus()
    await p.keyboard.press('Tab')
    await p.keyboard.press('Shift+Tab')
    check(await primary.evaluate(el => getComputedStyle(el).outlineWidth === '2px'), 'Primary keyboard focus remains visible')
    await capture('shared-button-focus-1440')
    await primary.hover()
    await p.mouse.down()
    const activeFill = await primary.evaluate(el => getComputedStyle(el).backgroundColor)
    await capture('shared-button-active-1440')
    await p.mouse.up()
    check(activeFill === 'rgb(158, 32, 43)', 'Primary active fill uses the action ramp')
    const disabled = await p.getByRole('button', { name: 'Недоступно', exact: true }).evaluate(el => ({
      opacity: getComputedStyle(el).opacity, background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color,
    }))
    check(disabled.opacity === '1' && disabled.background === 'rgb(19, 19, 21)', 'Disabled action has an explicit opaque surface')
    check(await p.getByRole('button', { name: 'Завантаження', exact: true }).isDisabled(), 'Loading action prevents repeat activation')
    check(await p.getByLabel('Помилка').getAttribute('aria-invalid') === 'true', 'Error input has invalid semantics')
    check(errors.length === 0, `No console or page errors: ${errors.join('; ')}`)
    check(mutations.length === 0, 'No API mutations or lock requests')
    return { results, states, fonts, errors, mutations, defaultFill, hoverFill, activeFill, disabled, note: 'Booking step 1 only. No SignalR/seat/checkout assertions. Admin 768/1440 only. Synthetic JWT confined to disposable context.' }
  } finally { await context.close() }
}
