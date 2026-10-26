// Run with Playwright browser_run_code (filename), after starting Bun's dev server.
// API fixtures live only in this disposable browser context; no browser dependency is installed.
// biome-ignore lint/correctness/noUnusedVariables: The browser tool invokes this function.
async function checkPresentationRefinement(page) {
  const context = await page
    .context()
    .browser()
    .newContext({
      viewport: { width: 1440, height: 1200 },
      reducedMotion: 'reduce',
    })
  const p = await context.newPage()
  const checks = []
  const pageErrors = []
  let state = 'long'
  let releaseLoading
  let loadingGate = new Promise(resolve => {
    releaseLoading = resolve
  })
  const assert = (condition, message) => {
    if (!condition) throw new Error(message)
    checks.push(message)
  }
  const trigger = () => p.getByRole('button', { name: 'Версія', exact: true })
  const choose = async name => {
    await trigger().click()
    await p.getByRole('menuitemradio', { name, exact: true }).click()
  }
  const checkFooter = async label => {
    const bounds = await p.locator('footer').evaluate(footer => ({
      bottom: footer.getBoundingClientRect().bottom + scrollY,
      documentHeight: document.documentElement.scrollHeight,
      viewportHeight: innerHeight,
      sibling: footer.previousElementSibling?.tagName,
    }))
    assert(bounds.sibling === 'MAIN', `${label}: footer follows main`)
    assert(
      Math.abs(bounds.bottom - bounds.documentHeight) < 2,
      `${label}: no empty area below footer`,
    )
    assert(
      bounds.bottom >= bounds.viewportHeight - 1,
      `${label}: footer reaches viewport bottom`,
    )
  }
  const movie = {
    id: 'presentation-test-film',
    title: 'Дуже довга українська назва: Єє Іі Її Ґґ',
    description:
      'Перевірка української типографіки та повного тексту без обрізання.',
    durationMinutes: 120,
    genres: ['Драма'],
    status: 2,
    releaseYear: 2026,
    rating: 0,
    backdropUrl: '',
  }
  const starts = new Date(Date.now() + 86400000).toISOString()
  p.on('pageerror', error => pageErrors.push(error.message))
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (
      url.origin === 'http://127.0.0.1:5173' &&
      !url.pathname.startsWith('/api/')
    )
      return route.continue()
    const path = url.pathname.replace(/^\/api/, '')
    if (path === '/movies') {
      if (state === 'loading') await loadingGate
      return route.fulfill(
        state === 'error'
          ? { status: 503, json: { title: 'Unavailable' } }
          : {
              json: {
                items:
                  state === 'empty'
                    ? []
                    : Array.from({ length: 6 }, (_, index) => ({
                        ...movie,
                        id: `${movie.id}-${index}`,
                      })),
              },
            },
      )
    }
    if (path.startsWith('/movies/'))
      return route.fulfill({ status: 503, json: { title: 'Unavailable' } })
    if (path === '/sessions')
      return route.fulfill({
        json: {
          items: Array.from({ length: 6 }, (_, index) => ({
            id: `s-${index}`,
            movieId: `${movie.id}-${index}`,
            hallId: 'h',
            hallName: 'Зал 1',
            startTime: starts,
            status: 'Scheduled',
          })),
        },
      })
    if (path === '/halls')
      return route.fulfill({ json: { items: [{ id: 'h', name: 'Зал 1' }] } })
    return route.continue()
  })
  try {
    await p.goto('http://127.0.0.1:5173/')
    await trigger().click()
    assert(
      (await p
        .getByRole('menuitemradio', { name: 'Classic', exact: true })
        .getAttribute('aria-checked')) === 'true',
      'Classic is the initial selection',
    )
    await p.keyboard.press('End')
    assert(
      await p
        .getByRole('menuitemradio', { name: 'New', exact: true })
        .evaluate(el => el === document.activeElement),
      'End focuses New',
    )
    await p.keyboard.press('Home')
    await p.keyboard.press('ArrowDown')
    await p.keyboard.press('ArrowUp')
    assert(
      await p
        .getByRole('menuitemradio', { name: 'Classic', exact: true })
        .evaluate(el => el === document.activeElement),
      'Home and arrow navigation work',
    )
    await p.keyboard.press('n')
    await p.keyboard.press('Space')
    await p.locator('.programme-shell').waitFor()
    await p.locator('.programme-film').first().waitFor()
    await p.evaluate(() => document.fonts.ready)
    assert(
      (await trigger().getAttribute('aria-expanded')) === 'false',
      'Selection dismisses dropdown',
    )
    await trigger().focus()
    await p.keyboard.press('Enter')
    assert(
      (await p
        .getByRole('menuitemradio', { name: 'New', exact: true })
        .getAttribute('aria-checked')) === 'true',
      'New is marked active',
    )
    await p.keyboard.press('Escape')
    assert(
      await trigger().evaluate(el => el === document.activeElement),
      'Escape returns focus',
    )
    await trigger().click()
    await p.getByRole('heading', { level: 1 }).click()
    assert(
      (await trigger().getAttribute('aria-expanded')) === 'false',
      'Outside click dismisses dropdown',
    )
    await trigger().click()
    await p.keyboard.press('Tab')
    assert(
      (await trigger().getAttribute('aria-expanded')) === 'false',
      'Tab dismisses dropdown without trapping focus',
    )
    await p.reload()
    await p.locator('.programme-shell').waitFor()
    assert(
      (await p.evaluate(() =>
        localStorage.getItem('cinema-presentation-v1'),
      )) === 'new',
      'New persists on refresh',
    )
    await p.locator('.programme-film').first().waitFor()
    const fonts = await p.locator('.programme-shell').evaluate(shell => ({
      body: getComputedStyle(shell).fontFamily,
      display: getComputedStyle(shell.querySelector('h2')).fontFamily,
    }))
    assert(
      fonts.body.includes('Golos Text Variable') &&
        fonts.display.includes('Roboto Condensed Variable'),
      'New uses Fontsource variable families',
    )
    for (const width of [320, 390, 768, 1440]) {
      await p.setViewportSize({ width, height: 1000 })
      assert(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `New has no overflow at ${width}px`,
      )
      await checkFooter(`New long ${width}px`)
    }
    await p.setViewportSize({ width: 768, height: 1024 })
    await p.evaluate(() => {
      document.documentElement.style.fontSize = '200%'
    })
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      'New has no overflow with 200% text',
    )
    await p.evaluate(() => {
      document.documentElement.style.fontSize = ''
    })
    await p.setViewportSize({ width: 390, height: 844 })
    await choose('Classic')
    await p
      .getByRole('button', { name: 'Відкрити меню', exact: true })
      .waitFor()
    await p.getByRole('button', { name: 'Відкрити меню', exact: true }).click()
    await trigger().click()
    assert(
      await p
        .getByRole('menu')
        .evaluate(
          el =>
            el.getBoundingClientRect().left >= 0 &&
            el.getBoundingClientRect().right <= innerWidth,
        ),
      'Classic mobile popup stays inside viewport',
    )
    await p.keyboard.press('Escape')
    assert(
      (await p
        .getByRole('button', { name: 'Закрити меню', exact: true })
        .getAttribute('aria-expanded')) === 'true',
      'Dropdown Escape preserves the mobile navigation dialog',
    )
    await p.keyboard.press('Escape')
    await p
      .getByRole('button', { name: 'Відкрити меню', exact: true })
      .waitFor()
    await p.getByRole('button', { name: 'Відкрити меню', exact: true }).click()
    await choose('New')
    await p.locator('.programme-shell').waitFor()
    assert(
      await p
        .locator('main')
        .evaluate(el => !el.inert && !el.closest('[inert]')),
      'Switching releases Classic menu focus isolation',
    )
    for (const width of [1440, 390]) {
      await p.setViewportSize({ width, height: 1200 })
      for (const mode of ['empty', 'error', 'loading']) {
        state = mode
        if (mode === 'loading')
          loadingGate = new Promise(resolve => {
            releaseLoading = resolve
          })
        await p.reload()
        await p
          .getByText(
            mode === 'empty'
              ? 'Афіша скоро поповниться'
              : mode === 'error'
                ? 'Афіша тимчасово недоступна'
                : 'Завантажуємо афішу…',
            { exact: true },
          )
          .waitFor()
        await checkFooter(`New ${mode} ${width}px`)
        if (mode === 'loading') releaseLoading()
      }
    }
    await p.setViewportSize({ width: 1440, height: 1200 })
    await choose('Classic')
    for (const width of [1440, 390]) {
      await p.setViewportSize({ width, height: 1200 })
      for (const mode of ['long', 'empty', 'error', 'loading']) {
        state = mode
        if (mode === 'loading')
          loadingGate = new Promise(resolve => {
            releaseLoading = resolve
          })
        await p.reload()
        if (mode === 'loading')
          await p.locator('main .animate-spin').first().waitFor()
        else if (mode === 'long')
          await p
            .getByRole('heading', { name: 'Зараз у кіно', exact: true })
            .waitFor()
        else
          await p
            .getByRole('heading', {
              name:
                mode === 'empty'
                  ? 'Афіша скоро поповниться'
                  : 'Не вдалося завантажити дані',
              exact: true,
            })
            .waitFor()
        await checkFooter(`Classic ${mode} ${width}px`)
        assert(
          await p.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `Classic ${mode} has no overflow at ${width}px`,
        )
        if (mode === 'loading') releaseLoading()
      }
    }
    await p.setViewportSize({ width: 1440, height: 1200 })
    await p.goto('http://127.0.0.1:5173/movies/short-error')
    await p
      .getByRole('heading', {
        name: 'Не вдалося завантажити дані',
        exact: true,
      })
      .waitFor()
    await checkFooter('Classic short error')
    assert(
      await p
        .locator('main')
        .evaluate(el =>
          getComputedStyle(el).fontFamily.includes('Montserrat Variable'),
        ),
      'Classic retains Montserrat',
    )
    await p.goto('http://127.0.0.1:5173/auth/login')
    await p.locator('input[type=email]').fill('preserved@example.com')
    await choose('New')
    assert(
      (await p.locator('input[type=email]').inputValue()) ===
        'preserved@example.com',
      'Shared form state survives preference changes',
    )
    await p.goto('http://127.0.0.1:5173/booking/presentation-test-film')
    await p.locator('header').waitFor()
    assert(
      (await p.locator('[data-presentation-trigger]').count()) === 0,
      'Booking has no presentation switch',
    )
    assert(pageErrors.length === 0, 'No uncaught page errors')
    return { checks: checks.length, results: checks }
  } finally {
    releaseLoading()
    await context.close()
  }
}
