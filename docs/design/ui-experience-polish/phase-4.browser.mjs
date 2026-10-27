// Run through Playwright MCP against the real application entry with isolated GET fixtures.
async (page, { baseUrl = 'http://127.0.0.1:5175', edgeCases = false } = {}) => {
  const output = 'D:/PROGRAMMINGPROJECTS/cinema-platform-front/docs/design/ui-experience-polish'
  const context = await page.context().browser().newContext({ locale: 'uk-UA', timezoneId: 'Europe/Kyiv' })
  const p = await context.newPage()
  const results = [], errors = [], mutations = []
  const check = (name, passed, details) => {
    results.push({ name, passed, details })
    if (!passed) throw new Error(`${name}: ${JSON.stringify(details)}`)
  }
  p.on('pageerror', error => errors.push(error.message))
  p.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await context.addInitScript(() => {
    const NativeDate = Date, fixed = NativeDate.parse('2026-10-27T09:00:00Z')
    window.Date = class extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [fixed])) }
      static now() { return fixed }
    }
  })
  const movie = { id: 'film', title: 'Бійцівський клуб', description: 'Культова історія про пошук себе на великому екрані.', durationMinutes: 139, releaseYear: 1999, rating: 8.8, status: 2, genres: ['Драма'], cast: [], posterUrl: '/placeholder-wip.jpg', backdropUrl: '/placeholder-wip.jpg' }
  const paginated = items => ({ items, pageNumber: 1, totalPages: 1, totalCount: items.length })
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url())
    if (request.isNavigationRequest()) return route.continue()
    if (['xhr', 'fetch'].includes(request.resourceType()) && !url.pathname.startsWith('/src/')) {
      if (request.method() !== 'GET') { mutations.push(url.pathname); return route.abort() }
      const headers = { 'Access-Control-Allow-Origin': '*' }
      if (url.pathname.endsWith('/movies')) return route.fulfill({ json: paginated([movie]), headers })
      if (url.pathname.endsWith('/movies/film')) return route.fulfill({ json: movie, headers })
      if (url.pathname.endsWith('/sessions')) return route.fulfill({ json: paginated([{
        id: 'session', movieId: 'film', movieTitle: movie.title, hallId: 'hall', hallName: 'Зал 1',
        startTime: '2026-10-27T16:00:00Z', endTime: '2026-10-27T18:19:00Z', status: 'Scheduled', price: 250,
      }]), headers })
      if (url.pathname.endsWith('/halls')) return route.fulfill({ json: paginated([{id:'hall',name:'Зал 1',totalCapacity:80,technologies:[]}]), headers })
      if (url.pathname.endsWith('/account/profile')) return route.fulfill({ json: {firstName:'Олександра',lastName:'Кінолюбителька',email:'fixture@example.test'}, headers })
      return route.fulfill({ json: [], headers })
    }
    if (url.origin !== baseUrl) return route.fulfill({ status: 204 })
    return route.continue()
  })
  const capture = name => p.screenshot({ path: `${output}/screenshots/phase-4-${name}.png` })
  const open = async () => { await p.getByRole('button', { name: 'Відкрити меню', exact: true }).click(); await p.waitForTimeout(350) }
  const close = async () => { await p.keyboard.press('Escape'); await p.waitForTimeout(250) }
  const state = () => p.evaluate(() => ({ y: scrollY, locked: document.body.style.overflow === 'hidden', lenis: document.documentElement.classList.contains('lenis'), stopped: document.documentElement.classList.contains('lenis-stopped'), overflow: document.documentElement.scrollWidth > innerWidth, inert: document.getElementById('root').inert }))
  try {
    if (edgeCases) {
      await p.setViewportSize({width:1440,height:1000})
      await p.goto(baseUrl,{waitUntil:'networkidle'})
      await p.locator('h1').waitFor()
      await p.mouse.move(700,500)
      await p.mouse.wheel(0,800)
      await p.getByRole('button',{name:'Відкрити меню'}).click()
      const lockedY = (await state()).y
      await p.waitForTimeout(500)
      check('opening interrupts in-flight Lenis inertia', (await state()).stopped && Math.abs((await state()).y-lockedY)<1,await state())
      await p.getByRole('button',{name:'Закрити меню',exact:true}).press('Enter')
      await p.waitForTimeout(250)
      check('keyboard close restores scroll position', !(await state()).locked && Math.abs((await state()).y-lockedY)<1,await state())
      for(let i=0;i<3;i++){await open();await close()}
      check('repeated open/close has no stale lock', !(await state()).stopped && !(await state()).inert,await state())
      await p.getByRole('button',{name:'Відкрити меню'}).focus()
      await p.keyboard.press('Enter')
      check('keyboard opens menu', await p.getByRole('dialog').isVisible())
      await p.emulateMedia({reducedMotion:'reduce'})
      await p.waitForTimeout(300)
      check('reduced motion changed while open removes Lenis', !(await state()).lenis && (await state()).locked,await state())
      await p.emulateMedia({reducedMotion:'no-preference'})
      await p.waitForTimeout(400)
      check('Lenis mounting under modal starts stopped', (await state()).lenis && (await state()).stopped,await state())
      await close()
      await p.setViewportSize({width:320,height:360});await open()
      const inner=p.locator('.ticket-paper > div').last()
      await p.mouse.move(150,250);await p.mouse.wheel(0,500);await p.waitForTimeout(300)
      check('Home ticket native internal wheel scrolling', await inner.evaluate(e=>e.scrollTop>0) && (await state()).locked && (await state()).stopped,await inner.evaluate(e=>({scrollTop:e.scrollTop,clientHeight:e.clientHeight,scrollHeight:e.scrollHeight})))
      await p.getByRole('dialog').locator('a[href="/offers"] > span:last-child').evaluate(e=>e.textContent='Пропозиції для постійних відвідувачів')
      check('long navigation label wraps inside paper', await p.locator('.ticket-paper').evaluate(e=>e.scrollWidth<=e.clientWidth) && !(await state()).overflow)
      await p.getByRole('dialog').locator('a[href="/offers"]').scrollIntoViewIfNeeded()
      await capture('long-label-320')
      await close()
      await p.setViewportSize({width:1440,height:1000})
      await p.locator('header').getByRole('link',{name:'Сеанси',exact:true}).click()
      await p.waitForURL('**/sessions');await p.waitForTimeout(400);await open()
      await p.goBack();await p.waitForTimeout(500)
      check('history navigation dismisses modal and resumes Home Lenis', await p.getByRole('dialog').count()===0 && !(await state()).locked && !(await state()).stopped && (await state()).lenis,await state())
      check('edge console health',errors.length===0,errors)
      return {results,errors,mutations,note:'Additional inertia, keyboard, dynamic reduced-motion, internal scrolling and history checks.'}
    }
    for (const preference of ['no-preference', 'reduce']) {
      await p.emulateMedia({ reducedMotion: preference })
      for (const width of [1440, 768, 390, 320]) {
        await p.setViewportSize({ width, height: width === 1440 ? 1000 : 844 })
        await p.goto(baseUrl, { waitUntil: 'networkidle' })
        await p.locator('h1').waitFor()
        await p.evaluate(() => document.fonts.ready)
        await p.waitForTimeout(400)
        const label = `${preference === 'reduce' ? 'reduced' : 'motion'}-${width}`
        check(`${label} page identity`, await p.title() === 'Cinema Platform' && p.url() === `${baseUrl}/` && await p.locator('h1').innerText() === movie.title, await state())
        check(`${label} clean layout`, !(await state()).overflow && await p.locator('vite-error-overlay').count() === 0, await state())
        if (preference === 'no-preference') await capture(`closed-${width}`)
        await open()
        const dialog = p.getByRole('dialog', { name: 'Головне меню' })
        const opened = await state()
        check(`${label} isolated modal`, opened.locked && opened.inert && (preference === 'reduce' ? !opened.lenis : opened.stopped), opened)
        check(`${label} close initially focused`, await p.getByRole('button', { name: 'Закрити меню', exact: true }).evaluate(e => e === document.activeElement))
        check(`${label} five destinations + active route`, await dialog.locator('nav a').count() === 5 && await dialog.locator('nav a[aria-current="page"]').getAttribute('href') === '/')
        const targets = await dialog.locator('a,button:not([tabindex="-1"])').evaluateAll(es => es.map(e => ({label:e.textContent || e.getAttribute('aria-label'),height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width})))
        check(`${label} touch targets`, targets.every(e => e.height >= 44 && e.width >= 44), targets)
        await p.keyboard.press('Shift+Tab')
        check(`${label} reverse focus wrap`, await p.evaluate(() => document.activeElement.getAttribute('href') === 'mailto:support@cinema.ua'))
        await p.keyboard.press('Tab')
        check(`${label} forward focus wrap`, await p.getByRole('button', { name: 'Закрити меню', exact: true }).evaluate(e => e === document.activeElement))
        for (let i = 0; i < 14; i++) await p.keyboard.press('Tab')
        check(`${label} focus remains inside`, await dialog.evaluate(e => e.contains(document.activeElement)))
        const beforeWheel = (await state()).y
        await p.mouse.move(5, 400); await p.mouse.wheel(0, 650); await p.waitForTimeout(350)
        check(`${label} background wheel blocked`, Math.abs((await state()).y - beforeWheel) < 1, await state())
        if (preference === 'no-preference') await capture(`open-${width}`)
        await close()
        const closed = await state()
        check(`${label} lock + focus restored`, !closed.locked && !closed.inert && !closed.stopped && await p.getByRole('button', { name: 'Відкрити меню' }).evaluate(e => e === document.activeElement), closed)
        check(`${label} hidden links absent`, await p.getByRole('dialog').count() === 0 && await p.getByRole('link', {name:'Зареєструватися',exact:true}).count() === 0)
        await p.mouse.move(width / 2, 500); await p.mouse.wheel(0, 550); await p.waitForTimeout(600)
        check(`${label} scroll resumes`, (await state()).y > beforeWheel + 100, await state())
        check(`${label} scrolled header`, await p.locator('header').getAttribute('data-header-surface') === 'solid')
        if (preference === 'no-preference') await capture(`scrolled-${width}`)
        await open(); const savedY = (await state()).y
        await p.getByRole('button', {name:'Закрити меню поза квитком'}).click({position:{x:2,y:400}})
        await p.waitForTimeout(250)
        check(`${label} backdrop + position`, await p.getByRole('dialog').count() === 0 && Math.abs((await state()).y - savedY) < 1)
        await open(); await dialog.getByRole('link', {name:'Сеанси',exact:true}).click()
        await p.waitForURL('**/sessions'); await p.waitForTimeout(450)
        const routed = await state()
        check(`${label} Home exit restores native scrolling`, !routed.locked && !routed.stopped && !routed.lenis && await p.getByRole('dialog').count() === 0, routed)
        await open()
        check(`${label} standard route active`, await dialog.locator('nav a[aria-current="page"]').getAttribute('href') === '/sessions')
        await close()
      }
    }
    await p.setViewportSize({width:320,height:360})
    await p.goto(`${baseUrl}/about`, {waitUntil:'networkidle'})
    await open()
    const scrollPanel = p.locator('.ticket-paper > div').last()
    await scrollPanel.evaluate(e => e.scrollTop = e.scrollHeight)
    check('short viewport internal scroll + fixed close', await scrollPanel.evaluate(e => e.scrollHeight > e.clientHeight && e.scrollTop > 0) && await p.getByRole('button',{name:'Закрити меню',exact:true}).isVisible(), await p.locator('.ticket-paper').boundingBox())
    await capture('short-320')
    await close()

    // Simulated identity is confined to this disposable fixture context.
    await p.evaluate(() => {
      const payload = {sub:'fixture-user',email:'fixture@example.test',firstName:'Олександра-Вікторія',lastName:'Кінолюбителька-Довгопрізвищенко',role:'User'}
      const encode = value => btoa(unescape(encodeURIComponent(JSON.stringify(value))))
      localStorage.setItem('cinema_access_token', `${encode({alg:'none'})}.${encode(payload)}.fixture`)
      localStorage.setItem('cinema_refresh_token', 'fixture')
    })
    await p.setViewportSize({width:390,height:844}); await p.reload({waitUntil:'networkidle'}); await open()
    const dialog = p.getByRole('dialog')
    check('authenticated account + tickets reuse Profile', await dialog.getByRole('link',{name:'Кабінет і квитки'}).getAttribute('href') === '/profile' && await dialog.getByRole('button',{name:'Вийти'}).isVisible() && await dialog.getByRole('link',{name:'Увійти',exact:true}).count() === 0)
    check('long Ukrainian name fits', await dialog.evaluate(e => e.scrollWidth <= e.clientWidth))
    await capture('authenticated-390')
    await dialog.getByRole('button',{name:'Вийти'}).click(); await p.waitForURL('**/auth/login'); await p.waitForTimeout(300)
    check('logout clears tokens and restores lock', await p.evaluate(() => !localStorage.getItem('cinema_access_token') && !localStorage.getItem('cinema_refresh_token') && document.body.style.overflow !== 'hidden'))

    for (const route of ['/','/sessions','/about','/offers','/bar','/faq','/auth/login','/auth/register','/halls','/technologies','/careers','/rules','/privacy','/offer','/age-limits','/movies/film','/booking/session','/profile','/account/loyalty','/account/loyalty/history','/profile/achievements']) {
      await p.goto(`${baseUrl}${route}`,{waitUntil:'networkidle'}); await open(); await close()
      const restored = await state()
      check(`route modal lifecycle ${route}`, !restored.locked && !restored.inert && !restored.stopped, restored)
    }
    check('console and runtime health', errors.length === 0, errors)
    check('no API mutations', mutations.length === 0, mutations)
    return {results,errors,mutations,note:'Chromium, fixture GET reads and simulated auth only. No real API credentials or data.'}
  } catch (error) {
    return { results, errors, mutations, failure: String(error), url: p.url() }
  } finally { await context.close() }
}
