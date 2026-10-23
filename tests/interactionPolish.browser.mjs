// Optional focused Playwright check. Start the existing Bun dev server first.
// Pass this function to browser_run_code; no browser dependency is installed.
// biome-ignore lint/correctness/noUnusedVariables: Playwright invokes this function directly.
async function checkInteractionPolish(page, screenshotDirectory) {
  const context = await page.context().browser().newContext()
  const harnessContext = await page.context().browser().newContext()
  const p = await context.newPage()
  const results = []
  const errors = []
  const screenshots = []
  const baseUrl = 'http://127.0.0.1:5173'
  const image = `${baseUrl}/placeholder-wip.jpg`
  const movies = [1, 2, 3].map(n => ({
    id: `film-${n}`,
    title: `Фільм ${n}`,
    description: 'Історія для великого екрана. Оберіть сеанс і зручне місце.',
    durationMinutes: 120,
    rating: 8,
    releaseYear: 2026,
    genres: ['Драма'],
    status: 2,
    posterUrl: image,
    backdropUrl: image,
  }))
  const sessions = movies.map((m, n) => ({
    id: `session-${n}`,
    movieId: m.id,
    movieTitle: m.title,
    startTime: new Date(Date.now() + 300000).toISOString(),
    hallId: 'hall',
    hallName: 'Великий зал',
    price: 150,
    status: 'Scheduled',
  }))
  const paginated = items => ({
    items,
    pageNumber: 1,
    pageSize: 100,
    totalCount: items.length,
    totalPages: 1,
  })
  const check = (value, message) => {
    if (!value) throw new Error(message)
    results.push(message)
  }
  const capture = async (target, name) => {
    if (!screenshotDirectory) return
    const path = `${screenshotDirectory}/${name}.png`
    await target.screenshot({ path, fullPage: false })
    screenshots.push(path)
  }
  const monitor = target => {
    target.on('pageerror', error => errors.push(error.message))
    target.on('console', message => {
      if (message.type() === 'error') errors.push(message.text())
    })
  }
  const healthy = async (target, name) => {
    check(
      (await target.title()) === 'Cinema Platform',
      `${name}: page identity`,
    )
    check(
      (await target.locator('body').innerText()).length > 100,
      `${name}: meaningful content`,
    )
    check(
      (await target.locator('vite-error-overlay').count()) === 0,
      `${name}: no framework overlay`,
    )
    check(
      await target.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${name}: no root horizontal overflow`,
    )
  }
  monitor(p)
  try {
    const mockRoute = route => {
      const r = route.request()
      const url = new URL(r.url())
      if (url.origin === baseUrl && url.pathname.startsWith('/src/'))
        return route.continue()
      if (['xhr', 'fetch'].includes(r.resourceType())) {
        if (r.method() !== 'GET') return route.fulfill({ status: 204 })
        if (url.pathname.endsWith('/movies'))
          return route.fulfill({ json: paginated(movies) })
        if (url.pathname.endsWith('/sessions'))
          return route.fulfill({ json: paginated(sessions) })
        if (url.pathname.endsWith('/halls'))
          return route.fulfill({
            json: paginated([
              {
                id: 'hall',
                name: 'Великий зал',
                totalCapacity: 100,
                technologies: [],
              },
            ]),
          })
        return route.fulfill({ json: [] })
      }
      if (url.origin !== baseUrl && r.resourceType() === 'image')
        return route.fulfill({ status: 204 })
      return route.continue()
    }
    await context.route('**/*', mockRoute)
    await harnessContext.route('**/*', mockRoute)

    for (const width of [375, 768, 1280, 1440]) {
      await p.setViewportSize({ width, height: 900 })
      await p.goto(baseUrl)
      const hero = p.getByRole('region', { name: 'Фільми у прокаті' })
      await hero.getByRole('heading', { level: 1 }).waitFor()
      const second = hero
        .getByRole('button', { name: /Показати фільм «Фільм 2»/ })
        .filter({ visible: true })
      await second.click()
      check(
        (await hero.getByRole('heading', { level: 1 }).innerText()) ===
          'Фільм 2',
        `Manual selection at ${width}px`,
      )
      check(
        (await second.getAttribute('aria-pressed')) === 'true',
        `Active slide semantics at ${width}px`,
      )
      check(
        await second.evaluate(el => {
          const b = el.getBoundingClientRect()
          return b.width >= 40 && b.height >= 40
        }),
        `Touch-sized hero controls at ${width}px`,
      )
      await second.focus()
      await p.keyboard.press('Tab')
      check(
        await hero.evaluate(el => el.contains(document.activeElement)),
        `Hero keyboard controls at ${width}px`,
      )
      await healthy(p, `Home ${width}`)
      if (width === 375 || width === 1280) await capture(p, `hero-${width}`)

      const filter = p.getByRole('button', { name: 'IMAX', exact: true })
      await filter.click()
      check(
        (await filter.getAttribute('aria-pressed')) === 'true',
        `Home filter state at ${width}px`,
      )
      await p.getByRole('button', { name: 'Всі', exact: true }).click()
      const details = p.locator('.hover-actions a').first()
      await details.focus()
      check(
        await details.evaluate(el => el === document.activeElement),
        `MovieCard focus at ${width}px`,
      )
      await p.waitForFunction(
        () =>
          getComputedStyle(document.querySelector('.hover-actions')).opacity ===
          '1',
      )
      check(
        await details.evaluate(
          el => getComputedStyle(el.closest('.hover-actions')).opacity === '1',
        ),
        `MovieCard focus reveals action at ${width}px`,
      )

      await p.getByRole('button', { name: 'Відкрити меню' }).click()
      const menu = p.getByRole('dialog', { name: 'Головне меню' })
      await menu.getByRole('link', { name: 'Афіша', exact: true }).click()
      await p.waitForURL('**/sessions')
      await p.getByRole('button', { name: 'Скоро', exact: true }).waitFor()
      check(
        (await p.locator('main').count()) === 1,
        `One routed main without an outgoing wait at ${width}px`,
      )
      check(
        await p
          .locator('main')
          .evaluate(
            el =>
              getComputedStyle(el).filter === 'none' &&
              getComputedStyle(el).transform === 'none',
          ),
        `No route blur or scale at ${width}px`,
      )
      const dates = p
        .locator('button.selection-control')
        .filter({ has: p.locator('span.text-xl') })
      await dates.nth(1).click()
      check(
        (await dates.nth(1).getAttribute('aria-pressed')) === 'true',
        `Date selection at ${width}px`,
      )
      check(
        await dates
          .nth(1)
          .evaluate(el => getComputedStyle(el).scale === 'none'),
        `Date choice does not zoom at ${width}px`,
      )
      await healthy(p, `Schedule ${width}`)
    }

    // Isolated real components and React Query, with a deterministic browser clock.
    // No booking hook, SignalR connection, seat lock or payment request is created.
    const h = await harnessContext.newPage()
    monitor(h)
    await h.setViewportSize({ width: 1280, height: 900 })
    await h.goto(`${baseUrl}/auth/login`)
    await h.clock.install({ time: new Date('2030-01-01T00:00:00Z') })
    await h.clock.pauseAt(new Date('2030-01-01T00:01:00Z'))
    await h.evaluate(async movieDtos => {
      const { default: React } = await import(
        '/node_modules/.vite/deps/react.js'
      )
      const {
        default: { createRoot },
      } = await import('/node_modules/.vite/deps/react-dom_client.js')
      // Match Vite's versioned imports so providers share the component contexts.
      const source = await (
        await fetch('/src/features/movies/model/useHeroSlider.ts')
      ).text()
      const dependencies = [...source.matchAll(/from "([^"]+)"/g)].map(
        match => match[1],
      )
      const dependency = name =>
        dependencies.find(url => url.includes(`/${name}.js`))
      const { QueryClient, QueryClientProvider } = await import(
        dependency('@tanstack_react-query')
      )
      const { MemoryRouter, useLocation } = await import(
        dependency('react-router-dom')
      )
      const { default: Hero } = await import(
        '/src/features/movies/ui/HeroSection.tsx'
      )
      const { default: SeatSelector } = await import(
        '/src/features/booking/ui/SeatSelector.tsx'
      )
      const { GridLoader } = await import('/src/shared/ui/GridLoader.tsx')
      const { FlipWords } = await import('/src/shared/ui/FlipWords.tsx')
      const e = React.createElement
      const client = new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity, retry: false } },
      })
      const fixtureMovies = movieDtos.map(m => ({
        ...m,
        duration: m.durationMinutes,
        year: m.releaseYear,
        cast: [],
      }))
      client.setQueryData(['hero-movies'], fixtureMovies)
      const originalTimeout = window.setTimeout.bind(window)
      const originalClear = window.clearTimeout.bind(window)
      const timers = new Set()
      window.setTimeout = (callback, delay, ...args) => {
        let id
        id = originalTimeout(() => {
          timers.delete(id)
          callback(...args)
        }, delay)
        if (delay === 8000) timers.add(id)
        return id
      }
      window.clearTimeout = id => {
        timers.delete(id)
        originalClear(id)
      }
      let hidden = false
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => hidden,
      })
      document.getElementById('root').style.display = 'none'
      const host = document.createElement('div')
      document.body.append(host)
      let root = createRoot(host)
      const Location = () =>
        e('output', { id: 'fixture-location' }, useLocation().pathname)
      const render = children =>
        root.render(e(React.StrictMode, null, children))
      const renderHero = () =>
        render(
          e(
            QueryClientProvider,
            { client },
            e(
              MemoryRouter,
              null,
              e('button', { id: 'outside' }, 'Outside carousel'),
              e(Hero),
              e(Location),
            ),
          ),
        )
      window.__phase4 = {
        root,
        host,
        client,
        timers,
        fixtureMovies,
        renderHero,
        remount: () => {
          root = createRoot(host)
          window.__phase4.root = root
          renderHero()
        },
        setHidden: value => {
          hidden = value
          document.dispatchEvent(new Event('visibilitychange'))
        },
        renderSeats: () => {
          const seats = Array.from({ length: 9 }, (_, n) => ({
            id: `seat-${n}`,
            row: 'A',
            number: n + 1,
            gridX: n + 2,
            gridY: 2,
            status: n === 5 ? 'Maintenance' : 'Active',
            seatTypeId: 'type',
            seatTypeName:
              n === 0 || n === 3 ? 'VIP' : n === 1 ? 'Love Seat' : 'Standard',
          }))
          const occupancy = seats
            .map((s, n) => ({
              ...s,
              row: 1,
              rowLabel: 'A',
              type: s.seatTypeName,
              price: 150,
              isAvailable: n < 3 || n === 8,
              isSold: n === 4,
              isLocked: n === 2 || n === 3,
              isLockedByCurrentUser: n === 2,
            }))
            .filter((_, n) => n !== 7)
          window.__phase4.toggles = []
          render(
            e(
              'div',
              { className: 'p-4' },
              e(SeatSelector, {
                hall: {
                  id: 'hall',
                  name: 'Hall',
                  capacity: seats.length,
                  seats,
                },
                selectedSeats: [seats[2]],
                onToggleSeat: s => window.__phase4.toggles.push(s.id),
                pendingSeatIds: new Set(['seat-6']),
                availabilityVerified: true,
                occupancy: {
                  sessionId: 'session',
                  hallId: 'hall',
                  movieTitle: 'Film',
                  startTime: '',
                  seats: occupancy,
                },
              }),
              e(
                'div',
                { id: 'shared-loader' },
                e(GridLoader, { className: 'animate-spin' }),
              ),
              e(
                'div',
                { id: 'flip-words' },
                e(FlipWords, { words: ['Перший', 'Другий'] }),
              ),
            ),
          )
        },
      }
      renderHero()
    }, movies)
    const flush = () => h.clock.runFor(20)
    const title = () => h.getByRole('heading', { level: 1 }).innerText()
    const timers = () => h.evaluate(() => window.__phase4.timers.size)
    const outside = async () => {
      await h.mouse.move(1, 1)
      await h.locator('#outside').focus()
      await flush()
    }
    const select = async number => {
      await h
        .getByRole('button', {
          name: new RegExp(`Показати фільм «Фільм ${number}»`),
        })
        .first()
        .evaluate(el => el.click())
      await flush()
    }
    await flush()
    await h.getByRole('heading', { level: 1 }).waitFor()
    await outside()
    check(
      (await timers()) === 1,
      'StrictMode creates exactly one autoplay timer',
    )
    await h.clock.runFor(7900)
    check(
      (await title()) === 'Фільм 1',
      'Autoplay preserves the eight-second reading interval',
    )
    await h.clock.runFor(200)
    check((await title()) === 'Фільм 2', 'Autoplay advances normally')
    check((await timers()) === 1, 'Autoplay schedules only one next timer')

    await h.clock.runFor(7600)
    await select(3)
    check((await title()) === 'Фільм 3', 'Manual selection is immediate')
    await h.clock.runFor(7900)
    check(
      (await title()) === 'Фільм 3',
      'Manual selection resets the full autoplay interval',
    )
    await h.clock.runFor(200)
    check(
      (await title()) === 'Фільм 1',
      'Autoplay wraps after manual selection',
    )
    await select(1)
    await h.clock.runFor(7900)
    check(
      (await title()) === 'Фільм 1',
      'Selecting the active film also resets its reading interval',
    )

    await h.getByRole('button', { name: 'Купити квиток', exact: true }).hover()
    await flush()
    check((await timers()) === 0, 'Hover cancels autoplay')
    await h.clock.runFor(16000)
    check((await title()) === 'Фільм 1', 'Hover protects CTA reading time')
    await outside()
    check((await timers()) === 1, 'Leaving hover resumes with a fresh interval')
    await h.getByRole('button', { name: 'Купити квиток', exact: true }).focus()
    await flush()
    check((await timers()) === 0, 'Keyboard focus cancels autoplay')
    await h.clock.runFor(16000)
    check((await title()) === 'Фільм 1', 'Keyboard focus protects CTA identity')
    await outside()

    await h.evaluate(() => window.__phase4.setHidden(true))
    await flush()
    check((await timers()) === 0, 'Hidden-tab event clears autoplay')
    await h.clock.runFor(16000)
    check((await title()) === 'Фільм 1', 'Hidden tab does not advance')
    await h.evaluate(() => window.__phase4.setHidden(false))
    await flush()
    check((await timers()) === 1, 'Visibility resumes autoplay')

    await h
      .getByRole('button', { name: 'Призупинити автоматичну зміну фільмів' })
      .click()
    await outside()
    await h.evaluate(() => {
      window.__phase4.setHidden(true)
      window.__phase4.setHidden(false)
    })
    await flush()
    await h.clock.runFor(16000)
    check(
      (await timers()) === 0 && (await title()) === 'Фільм 1',
      'Explicit pause survives visibility and interaction changes',
    )
    await h
      .getByRole('button', { name: 'Відновити автоматичну зміну фільмів' })
      .click()
    await outside()
    check((await timers()) === 1, 'Explicit resume restarts after focus leaves')

    await h.emulateMedia({ reducedMotion: 'reduce' })
    await h.getByRole('button', { name: /Автопоказ вимкнено/ }).waitFor()
    await flush()
    check(
      (await timers()) === 0,
      'Live reduced-motion preference stops autoplay',
    )
    check(
      await h.getByRole('button', { name: /Автопоказ вимкнено/ }).isDisabled(),
      'Reduced motion explains disabled autoplay',
    )
    await select(2)
    await h.clock.runFor(16000)
    check(
      (await title()) === 'Фільм 2',
      'Reduced motion retains manual selection without autoplay',
    )
    check(
      await h
        .locator('.hero-image')
        .evaluate(el => getComputedStyle(el).animationName === 'none'),
      'Reduced-motion hero has no image animation',
    )
    await h.emulateMedia({ reducedMotion: 'no-preference' })
    await h
      .getByRole('button', { name: 'Призупинити автоматичну зміну фільмів' })
      .waitFor()
    await outside()
    check(
      (await timers()) === 1,
      'Live motion preference restores permitted autoplay',
    )

    await h.evaluate(() =>
      window.__phase4.client.setQueryData(
        ['hero-movies'],
        [...window.__phase4.fixtureMovies].reverse(),
      ),
    )
    await flush()
    check(
      (await title()) === 'Фільм 2',
      'Reordering movies preserves the active film',
    )
    await h.evaluate(() =>
      window.__phase4.client.setQueryData(
        ['hero-movies'],
        [window.__phase4.fixtureMovies[0]],
      ),
    )
    await flush()
    check(
      (await title()) === 'Фільм 1' && (await timers()) === 0,
      'Removed active film safely falls back and one-film list has no timer',
    )
    await h.evaluate(() =>
      window.__phase4.client.setQueryData(['hero-movies'], []),
    )
    await flush()
    check(
      (await h.locator('section').count()) === 0 && (await timers()) === 0,
      'Empty movie list removes the carousel and timer',
    )
    await h.evaluate(() =>
      window.__phase4.client.setQueryData(
        ['hero-movies'],
        window.__phase4.fixtureMovies,
      ),
    )
    await flush()
    await outside()
    check((await timers()) === 1, 'Refilling the list schedules one timer')
    const activeTitle = await title()
    const expectedPath = `/booking/${movies.find(movie => movie.title === activeTitle).id}`
    await h.getByRole('button', { name: 'Купити квиток', exact: true }).click()
    await h
      .locator('#fixture-location')
      .filter({ hasText: expectedPath })
      .waitFor()
    check(
      (await h.locator('#fixture-location').innerText()) === expectedPath,
      'Buy Ticket preserves movie navigation',
    )
    await h.evaluate(() => window.__phase4.root.unmount())
    check((await timers()) === 0, 'Unmount cancels the outstanding timer')
    await h.clock.runFor(16000)
    check(
      (await timers()) === 0,
      'No abandoned callback schedules further work',
    )

    // A new root also verifies the initial reduced-motion preference.
    await h.emulateMedia({ reducedMotion: 'reduce' })
    await h.evaluate(() => window.__phase4.remount())
    await h.getByRole('button', { name: /Автопоказ вимкнено/ }).waitFor()
    await flush()
    check(
      (await timers()) === 0,
      'Initial reduced-motion mount has no autoplay timer',
    )
    await h.evaluate(() => window.__phase4.renderSeats())
    await flush()
    const seatButtons = h.locator('button[aria-busy]')
    check(
      (await seatButtons.count()) === 9,
      'Sparse fixture renders only persisted seats',
    )
    check(
      (await seatButtons.nth(3).getAttribute('title')).includes('тимчасово'),
      'Locked tooltip is retained',
    )
    check(
      (await seatButtons.nth(4).getAttribute('title')).includes('придбане'),
      'Sold tooltip is retained',
    )
    check(
      (await seatButtons.nth(5).getAttribute('title')).includes(
        'обслуговуванні',
      ),
      'Maintenance tooltip is retained',
    )
    check(
      (await seatButtons.nth(7).getAttribute('aria-disabled')) === 'true',
      'Unknown availability remains disabled',
    )
    check(
      (await seatButtons.nth(6).getAttribute('aria-busy')) === 'true',
      'Pending seat remains busy',
    )
    check(
      (await h.locator('svg animate').count()) === 0,
      'Reduced motion removes pending and shared SVG animation',
    )
    const vipColor = await seatButtons
      .nth(0)
      .evaluate(el => getComputedStyle(el).color)
    const lockedColor = await seatButtons
      .nth(3)
      .evaluate(el => getComputedStyle(el).color)
    check(vipColor !== lockedColor, 'VIP and locked computed colors differ')
    check(
      await seatButtons
        .nth(3)
        .evaluate(el => getComputedStyle(el).borderStyle === 'dashed'),
      'Lock has a non-color dashed boundary',
    )
    check(
      (await seatButtons.nth(3).locator('.lucide-lock-keyhole').count()) === 1,
      'Lock has a non-color status symbol',
    )
    for (const index of [3, 4, 5, 6, 7])
      await seatButtons.nth(index).evaluate(el => el.click())
    check(
      await h.evaluate(() => window.__phase4.toggles.length === 0),
      'Unavailable seats cannot call selection',
    )
    await seatButtons.nth(0).focus()
    await h.keyboard.press('Enter')
    check(
      await h.evaluate(() => window.__phase4.toggles.join() === 'seat-0'),
      'Available seat retains keyboard activation',
    )
    check(
      await seatButtons
        .nth(0)
        .evaluate(el => getComputedStyle(el).outlineStyle !== 'none'),
      'Seat focus remains visible',
    )
    await h.clock.runFor(16000)
    check(
      (await h.locator('#flip-words').innerText()) === 'Перший',
      'Reduced-motion decorative words remain static',
    )
    for (const width of [375, 768, 1280]) {
      await h.setViewportSize({ width, height: 900 })
      await healthy(h, `Seat fixture ${width}`)
      const bounds = await seatButtons.nth(0).boundingBox()
      check(
        bounds.width === 32 && bounds.height === 32,
        `Seat grid remains 32px at ${width}px`,
      )
      if (width === 768) await capture(h, 'seats-768-reduced')
    }
    await h.emulateMedia({ reducedMotion: 'no-preference' })
    await h
      .locator('#shared-loader animate')
      .first()
      .waitFor({ state: 'attached' })
    await flush()
    check(
      (await h.locator('#shared-loader animate').count()) > 0,
      'Live preference restores loading animation',
    )
    await seatButtons.nth(0).hover()
    check(
      await seatButtons
        .nth(0)
        .evaluate(el => getComputedStyle(el).scale === 'none'),
      'Normal-motion seat hover does not zoom',
    )

    await h.clock.runFor(3500)
    check(
      (await h.locator('#flip-words').innerText()).includes('Другий'),
      'Normal-motion decorative words can advance',
    )
    await h.emulateMedia({ reducedMotion: 'reduce' })
    await h
      .locator('#shared-loader animate')
      .first()
      .waitFor({ state: 'detached' })
    await flush()
    await h
      .locator('#flip-words')
      .getByText('Перший', { exact: true })
      .waitFor()
    check(
      (await h.locator('#flip-words').innerText()) === 'Перший',
      'Live reduced motion stops decorative words',
    )
    await h.emulateMedia({ reducedMotion: 'no-preference' })
    await h
      .locator('#shared-loader animate')
      .first()
      .waitFor({ state: 'attached' })
    await h.clock.runFor(3500)
    check(
      (await h.locator('#flip-words').innerText()).includes('Перший'),
      'Decorative words recover after preference changes',
    )

    // Route changes are immediate under reduced motion and retain scroll reset.
    await p.emulateMedia({ reducedMotion: 'reduce' })
    await p.goto(baseUrl)
    await p.getByRole('heading', { level: 1 }).waitFor()
    await p.evaluate(() => window.scrollTo(0, 600))
    await p.getByRole('button', { name: 'Відкрити меню' }).click()
    await p
      .getByRole('dialog')
      .getByRole('link', { name: 'Про нас', exact: true })
      .click()
    await p.waitForURL('**/about')
    await p.locator('main h1').waitFor()
    check(
      await p
        .locator('main')
        .evaluate(el => getComputedStyle(el).opacity === '1'),
      'Reduced-motion route is immediately opaque',
    )
    check(
      await p.evaluate(() => scrollY === 0),
      'Route change retains scroll reset',
    )
    await p.goBack()
    await p.getByRole('heading', { level: 1 }).waitFor()
    check(
      new URL(p.url()).pathname === '/',
      'Browser back retains router behavior',
    )
    await healthy(p, 'Reduced-motion route navigation')
    check(
      errors.length === 0,
      `No app console/runtime errors: ${errors.join('; ')}`,
    )
    return { passed: results.length, checks: results, screenshots }
  } catch (error) {
    throw new Error(
      `${error.message}\nLast check: ${results.at(-1)}\nURL: ${p.url()}\nErrors: ${errors.join('; ')}\nPage: ${(
        await p
          .locator('body')
          .innerText()
          .catch(() => 'Page unavailable')
      ).slice(0, 1200)}`,
      {
        cause: error,
      },
    )
  } finally {
    await harnessContext.close()
    await context.close()
  }
}
