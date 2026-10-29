// Pass this function to Playwright browser_run_code via code or filename.
// Start `bun run dev --host 127.0.0.1` first. No browser dependency is installed.
// biome-ignore lint/correctness/noUnusedVariables: Playwright invokes this function directly.
async function checkAccessibility(page) {
  const context = await page.context().browser().newContext()
  const p = await context.newPage()
  const failures = []
  const results = []
  const baseUrl = 'http://127.0.0.1:5173'
  const image = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
  const movie = {
    id: 'accessibility-movie',
    title: 'Тестовий фільм із довгою назвою',
    description: 'Опис фільму',
    durationMinutes: 120,
    rating: 8,
    releaseYear: 2026,
    genres: ['Драма'],
    status: 2,
    posterUrl: image,
    backdropUrl: image,
  }
  const session = {
    id: 'accessibility-session',
    movieId: movie.id,
    movieTitle: movie.title,
    startTime: '2030-01-01T18:00:00Z',
    endTime: '2030-01-01T20:00:00Z',
    hallId: 'hall',
    hallName: 'Великий зал',
    pricingId: 'pricing',
    pricingName: 'Стандарт',
    status: 'Scheduled',
  }
  const paginated = items => ({
    items,
    pageNumber: 1,
    pageSize: 10,
    totalCount: items.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const check = (value, message) => {
    if (!value) throw new Error(message)
    results.push(message)
  }
  const focused = locator =>
    locator.evaluate(el => el === document.activeElement)
  const dialog = () => p.locator('[role="dialog"]:not([inert], [inert] *)')
  const cycleFocus = async () => {
    const controls = dialog().locator(
      'a[href], button:enabled, input:enabled, select:enabled, textarea:enabled',
    )
    await controls.last().waitFor({ state: 'visible' })
    await controls.last().focus()
    await p.keyboard.press('Tab')
    check(await focused(controls.first()), 'Tab wraps to the first control')
    await p.keyboard.press('Shift+Tab')
    check(await focused(controls.last()), 'Shift+Tab wraps to the last control')
  }
  let releaseMutation
  let mutationCount = 0
  const pendingMutation = () =>
    new Promise(resolve => {
      releaseMutation = resolve
    })
  let mutationGate
  p.on('pageerror', error => failures.push(error.message))

  try {
    // All API traffic is local fixture data; mutations never reach a backend.
    await p.route('**/*', async route => {
      const request = route.request()
      const url = new URL(request.url())
      if (!['xhr', 'fetch'].includes(request.resourceType())) {
        if (url.origin !== baseUrl && request.resourceType() === 'image')
          return route.abort()
        return route.continue()
      }
      if (request.method() !== 'GET') {
        mutationCount += 1
        if (mutationGate) await mutationGate
        return route.fulfill({ status: 204 })
      }
      if (url.pathname.endsWith('/movies/deleted')) {
        return route.fulfill({
          json: paginated([{ ...movie, deletedAt: '2026-10-20T12:00:00Z' }]),
        })
      }
      if (url.pathname.endsWith('/movies'))
        return route.fulfill({ json: paginated([movie]) })
      if (url.pathname.endsWith('/sessions'))
        return route.fulfill({ json: paginated([session]) })
      if (url.pathname.endsWith('/halls'))
        return route.fulfill({
          json: paginated([
            { id: 'hall', name: 'Великий зал', totalCapacity: 100 },
          ]),
        })
      if (url.pathname.endsWith('/pricings'))
        return route.fulfill({
          json: [{ id: 'pricing', name: 'Стандарт', items: [] }],
        })
      return route.fulfill({ json: [] })
    })

    for (const width of [375, 768, 1280]) {
      await p.setViewportSize({ width, height: 800 })
      await p.goto(`${baseUrl}/auth/login`)
      const email = p.getByLabel('Email', { exact: true })
      await email.waitFor()
      check(
        (await p.title()) === 'Cinema Platform',
        `Public page identity at ${width}px`,
      )
      check(
        (await p.locator('vite-error-overlay').count()) === 0,
        'No Vite error overlay',
      )
      await p.locator('label').filter({ hasText: 'Email' }).click()
      check(
        await focused(email),
        'Clicking a shared input label focuses its control',
      )
      await p.getByRole('button', { name: 'Увійти', exact: true }).click()
      await p.locator('[aria-invalid=true]').first().waitFor()
      check(
        await email.evaluate(el => {
          const ids = el.getAttribute('aria-describedby')?.split(' ') ?? []
          return ids.some(id =>
            document.getElementById(id)?.textContent.includes('email'),
          )
        }),
        'Validation error is associated with the input',
      )

      const menu = p.getByRole('button', { name: 'Відкрити меню' })
      const menuId = await menu.getAttribute('aria-controls')
      check(
        await p
          .locator(`[id="${menuId}"]`)
          .evaluate(
            el => el.inert && el.getAttribute('aria-hidden') === 'true',
          ),
        'Closed menu is inert and hidden from assistive technology',
      )
      await menu.focus()
      await p.keyboard.press('Enter')
      const close = p.getByRole('button', { name: 'Закрити меню' })
      check(
        (await close.getAttribute('aria-expanded')) === 'true',
        'Menu announces expanded state',
      )
      check(await focused(close), 'Menu has initial focus')
      check(
        await p.locator('main').evaluate(el => el.inert),
        'Menu background is inert',
      )
      check(
        await close.evaluate(
          el => getComputedStyle(el).outlineStyle !== 'none',
        ),
        'Menu button has a visible keyboard outline',
      )
      await p.getByRole('link', { name: 'Афіша', exact: true }).waitFor()
      check(
        (await p.getByRole('link', { name: 'Афіша', exact: true }).count()) ===
          1,
        'Rolling text has one accessible link name',
      )
      await cycleFocus()
      await p.keyboard.press('Escape')
      check(await focused(menu), 'Menu restores trigger focus after Escape')
    }

    // Synthetic credentials are confined to this disposable browser context.
    await p.addInitScript(() => {
      const claims = btoa(
        JSON.stringify({
          sub: 'accessibility-user',
          role: 'admin',
          firstName: 'QA',
        }),
      )
      localStorage.setItem('cinema_access_token', `e30.${claims}.fixture`)
    })
    for (const width of [768, 1024, 1280, 1440]) {
      await p.setViewportSize({ width, height: 600 })
      await p.goto(`${baseUrl}/admin/movies`)
      const edit = p.getByRole('button', {
        name: `Редагувати фільм «${movie.title}»`,
      })
      await edit.waitFor()
      if (width < 1024)
        await p.getByRole('button', { name: 'Меню', exact: true }).click()
      const layout = await p.evaluate(() => {
        const sidebar = document.querySelector('#admin-navigation')
        const nav = sidebar.querySelector('nav')
        const tableRegion = document.querySelector('section')
        const back = sidebar.querySelector('div:last-child')
        return {
          pageWidth: document.documentElement.scrollWidth,
          sidebarWidth: sidebar.getBoundingClientRect().width,
          navScrolls: nav.scrollHeight > nav.clientHeight,
          backVisible: back.getBoundingClientRect().bottom <= innerHeight,
          tableContained: tableRegion.scrollWidth >= tableRegion.clientWidth,
        }
      })
      check(
        layout.pageWidth <= width,
        `No page overflow at admin ${width}px (${layout.pageWidth}px)`,
      )
      check(
        layout.sidebarWidth === 224,
        `Sidebar or tablet drawer width at ${width}px`,
      )
      check(
        layout.navScrolls && layout.backVisible,
        'Long navigation scrolls while the profile link stays visible',
      )
      check(layout.tableContained, 'Movie table has a contained scroll region')
      check(
        (await p
          .getByRole('link', { name: 'Фільми', exact: true })
          .getAttribute('aria-current')) === 'page',
        'Admin active link has aria-current',
      )
      if (width < 1024) await p.keyboard.press('Escape')
      await edit.focus()
      await p.waitForFunction(
        () =>
          getComputedStyle(document.activeElement.parentElement).opacity ===
          '1',
      )
      check(
        await edit.evaluate(
          el => getComputedStyle(el.parentElement).opacity === '1',
        ),
        'Movie actions reveal on keyboard focus',
      )
      await p.keyboard.press('Enter')
      await dialog().waitFor()
      check(
        await p
          .getByRole('heading', { name: 'Редагувати фільм' })
          .evaluate(el => el === document.activeElement),
        'Edit dialog initial focus survives StrictMode',
      )
      check(
        (await p.getByLabel('Статус', { exact: true }).count()) === 1 &&
          (await p.getByLabel('Опис', { exact: true }).count()) === 1,
        'Edit dialog direct controls have associated labels',
      )
      await cycleFocus()
      await p.keyboard.press('Escape')
      check(await focused(edit), 'Edit dialog restores trigger focus')
    }

    // Short-height body scrolling and protected async submission in both forms.
    await p.setViewportSize({ width: 768, height: 400 })
    await p
      .getByRole('button', { name: `Редагувати фільм «${movie.title}»` })
      .click()
    const save = dialog().getByRole('button', { name: 'Зберегти', exact: true })
    check(
      await save.evaluate(
        el => el.getBoundingClientRect().bottom <= innerHeight,
      ),
      'Edit actions stay visible on a short viewport',
    )
    check(
      await dialog()
        .locator('form > div')
        .first()
        .evaluate(el => el.scrollHeight > el.clientHeight),
      'Edit body scrolls internally',
    )
    mutationGate = pendingMutation()
    await save.click()
    await p.waitForFunction(
      () =>
        document.querySelector('[role=dialog]')?.getAttribute('aria-busy') ===
        'true',
    )
    await p.keyboard.press('Escape')
    check(
      (await dialog().count()) === 1 &&
        (await dialog()
          .getByRole('button', { name: 'Закрити діалог' })
          .isDisabled()),
      'Saving blocks Escape and the close button',
    )
    releaseMutation()
    mutationGate = null
    await dialog().waitFor({ state: 'detached' })

    await p.goto(`${baseUrl}/admin/sessions`)
    const create = p.getByRole('button', { name: 'Додати сеанс', exact: true })
    await create.click()
    await p.getByLabel('Фільм', { exact: true }).waitFor()
    for (const label of ['Зал', 'Тариф', 'Дата', 'Час початку']) {
      check(
        (await p.getByLabel(label, { exact: true }).count()) === 1,
        `Session ${label} label association`,
      )
    }
    const schedule = dialog().getByRole('button', { name: 'Запланувати' })
    check(
      await schedule.evaluate(
        el => el.getBoundingClientRect().bottom <= innerHeight,
      ),
      'Session actions stay visible on a short viewport',
    )
    await cycleFocus()
    await p.keyboard.press('Escape')
    check(await focused(create), 'Create dialog restores focus')
    await create.click()
    await p.getByLabel('Фільм', { exact: true }).waitFor()
    await p.getByLabel('Дата', { exact: true }).fill('2030-01-01')
    mutationGate = pendingMutation()
    const previousMutations = mutationCount
    await schedule.click()
    await p.waitForFunction(
      () =>
        document.querySelector('[role=dialog]')?.getAttribute('aria-busy') ===
        'true',
    )
    await p.keyboard.press('Escape')
    check(
      (await dialog().count()) === 1 &&
        (await dialog()
          .getByRole('button', { name: 'Скасувати', exact: true })
          .isDisabled()),
      'Session submission blocks dismissal',
    )
    check(
      mutationCount === previousMutations + 1,
      'Session submission sends one request',
    )
    releaseMutation()
    mutationGate = null
    await dialog().waitFor({ state: 'detached' })

    const reschedule = p.getByRole('button', {
      name: `Перенести сеанс: ${movie.title}`,
    })
    await reschedule.focus()
    await p.waitForFunction(
      () =>
        getComputedStyle(document.activeElement.parentElement).opacity === '1',
    )
    check(
      await reschedule.evaluate(
        el => getComputedStyle(el.parentElement).opacity === '1',
      ),
      'Session actions reveal on keyboard focus',
    )
    await p.keyboard.press('Enter')
    check(
      await focused(p.getByLabel('Новий час початку', { exact: true })),
      'Input dialog focuses its input',
    )
    await cycleFocus()
    mutationGate = pendingMutation()
    await dialog()
      .getByRole('button', { name: 'Перенести', exact: true })
      .click()
    await p.waitForFunction(
      () =>
        document.querySelector('[role=dialog]')?.getAttribute('aria-busy') ===
        'true',
    )
    await p.keyboard.press('Escape')
    check(
      (await dialog().count()) === 1 &&
        (await dialog()
          .getByRole('button', { name: 'Закрити діалог' })
          .isDisabled()),
      'Input submission blocks dismissal',
    )
    releaseMutation()
    mutationGate = null
    await dialog().waitFor({ state: 'detached' })
    check(await focused(reschedule), 'Input dialog restores trigger focus')

    const cancel = p.getByRole('button', {
      name: `Скасування сеансу: ${movie.title}`,
    })
    await cancel.click()
    check(
      await focused(
        dialog().getByRole('button', { name: 'Скасувати', exact: true }),
      ),
      'Destructive confirmation initially focuses cancellation',
    )
    await cycleFocus()
    mutationGate = pendingMutation()
    await dialog().getByRole('button', { name: 'Так, скасувати' }).click()
    await p.waitForFunction(
      () =>
        document.querySelector('[role=dialog]')?.getAttribute('aria-busy') ===
        'true',
    )
    await p.keyboard.press('Escape')
    check(
      (await dialog().count()) === 1 &&
        (await dialog()
          .getByRole('button', { name: 'Скасувати', exact: true })
          .isDisabled()),
      'Async confirmation blocks dismissal without a caller loading prop',
    )
    releaseMutation()
    mutationGate = null
    await dialog().waitFor({ state: 'detached' })

    // Exercise actual shared dialogs in StrictMode, including nested portals.
    await p.evaluate(async () => {
      const { default: React } = await import(
        '/node_modules/.vite/deps/react.js'
      )
      const {
        default: { createRoot },
      } = await import('/node_modules/.vite/deps/react-dom_client.js')
      const { Dialog } = await import('/src/shared/ui/modals/Dialog.tsx')
      const { default: InputModal } = await import(
        '/src/shared/ui/modals/InputModal.tsx'
      )
      const host = document.createElement('div')
      host.style.cssText =
        'position:fixed;top:0;left:200px;padding:16px;background:black;z-index:200'
      document.body.append(host)
      const h = React.createElement
      const Harness = () => {
        const [outer, setOuter] = React.useState(false)
        const [inner, setInner] = React.useState(false)
        return h(
          React.Fragment,
          null,
          h('button', { onClick: () => setOuter(true) }, 'Open outer fixture'),
          h(
            Dialog,
            {
              isOpen: outer,
              onClose: () => setOuter(false),
              titleId: 'outer-title',
            },
            h('h2', { id: 'outer-title' }, 'Outer fixture'),
            h(
              'button',
              { onClick: () => setInner(true) },
              'Open inner fixture',
            ),
          ),
          h(InputModal, {
            isOpen: inner,
            title: 'Inner fixture',
            label: 'Fixture field',
            initialValue: 'draft',
            onSubmit: () => {},
            onClose: () => setInner(false),
          }),
          h(
            'button',
            { onClick: () => setOuter(false), id: 'remove-outer' },
            'Remove outer fixture',
          ),
        )
      }
      createRoot(host).render(h(React.StrictMode, null, h(Harness)))
    })
    const outerTrigger = p.getByRole('button', { name: 'Open outer fixture' })
    await outerTrigger.click()
    const innerTrigger = p.getByRole('button', { name: 'Open inner fixture' })
    await innerTrigger.click()
    await cycleFocus()
    await p.keyboard.press('Escape')
    check(
      await focused(innerTrigger),
      'Nested dialog restores its parent trigger',
    )
    await innerTrigger.click()
    await p.evaluate(() => document.getElementById('remove-outer').click())
    await p.keyboard.press('Escape')
    check(
      await focused(outerTrigger),
      'Closing a parent first preserves the outer restoration target',
    )
    for (let i = 0; i < 3; i += 1) {
      await outerTrigger.click()
      await p.keyboard.press('Escape')
    }
    check(await focused(outerTrigger), 'Rapid reopen and close restores focus')
    for (const width of [375, 768, 1280]) {
      await p.setViewportSize({ width, height: 400 })
      await outerTrigger.click()
      await innerTrigger.click()
      check(
        await dialog().evaluate(el => {
          const bounds = el.getBoundingClientRect()
          return (
            bounds.left >= 16 &&
            bounds.right <= innerWidth - 16 &&
            bounds.bottom <= innerHeight - 16
          )
        }),
        `Shared input dialog fits ${width}px on a short viewport`,
      )
      await cycleFocus()
      await p.keyboard.press('Escape')
      await p.keyboard.press('Escape')
    }
    check(
      (await p
        .locator('body')
        .evaluate(el => el.style.overflow !== 'hidden')) &&
        (await p.locator('[inert]').count()) === 0,
      'Modal cleanup restores scrolling and background interaction',
    )

    // A separate touch context checks CSS discoverability without hover.
    const touch = await page
      .context()
      .browser()
      .newContext({ hasTouch: true, viewport: { width: 768, height: 800 } })
    try {
      const t = await touch.newPage()
      t.on('pageerror', error => failures.push(error.message))
      await t.route('**/*', route => {
        const request = route.request()
        const url = new URL(request.url())
        if (['xhr', 'fetch'].includes(request.resourceType())) {
          return route.fulfill({
            json: paginated(
              url.pathname.endsWith('/movies') ? [{ ...movie, status: 1 }] : [],
            ),
          })
        }
        if (url.origin !== baseUrl && request.resourceType() === 'image')
          return route.abort()
        return route.continue()
      })
      await t.goto(`${baseUrl}/sessions`)
      await t.getByRole('button', { name: 'Скоро', exact: true }).click()
      await t.locator('.hover-actions').waitFor()
      const opacity = await t.evaluate(() => ({
        touch: matchMedia('(pointer: coarse)').matches,
        opacity: getComputedStyle(document.querySelector('.hover-actions'))
          .opacity,
      }))
      check(
        opacity.touch && opacity.opacity === '1',
        'Movie details are discoverable on a coarse pointer without hover',
      )
    } finally {
      await touch.close()
    }
    check(
      failures.length === 0,
      `No browser runtime errors: ${failures.join('; ')}`,
    )
    return { passed: results.length, checks: results }
  } catch (error) {
    const activeElement = await p
      .evaluate(() => document.activeElement?.outerHTML)
      .catch(() => 'Unavailable (page or execution context closed)')
    throw new Error(
      `${error.message}\nLast successful check: ${results.at(-1)}\nActive element: ${activeElement}`,
      { cause: error },
    )
  } finally {
    releaseMutation?.()
    await context.close()
  }
}
