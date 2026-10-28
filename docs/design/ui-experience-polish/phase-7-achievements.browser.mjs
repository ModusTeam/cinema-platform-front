// Disposable synthetic account fixtures. No fixture is imported by production.
async (page) => {
  const stage = 'after'
  const output = 'D:/PROGRAMMINGPROJECTS/cinema-platform-front/docs/design/ui-experience-polish'
  const baseUrl = 'http://127.0.0.1:5176'
  const results = [], errors = [], mutations = [], consoleErrors = []
  const check = (name, passed, detail) => {
    results.push({ name, passed, detail })
    if (!passed) throw new Error(name + ': ' + JSON.stringify(detail))
  }
  const c = await page.context().browser().newContext({ locale: 'uk-UA', timezoneId: 'Europe/Kyiv', reducedMotion: 'reduce' })
  const p = await c.newPage()
  await p.clock.setFixedTime(new Date('2026-10-28T09:00:00Z'))
  let scenario = 'normal'
  let hold = false, release, gate = Promise.resolve()
  const beginHold = () => { hold = true; gate = new Promise(resolve => { release = resolve }) }
  const finishHold = () => { hold = false; release?.() }
  const ticket = (id, status = 'Valid', seatNumber = 7) => ({ id: 'synthetic-ticket-' + id, movieTitle: 'Дюна: Частина друга', posterUrl: '/docs/design/ui-experience-polish/fixtures/phase-5/dune-poster.jpg', hallName: 'Великий зал', rowLabel: 'Б', seatNumber, seatType: 'Standard', price: 250, sessionStart: '2026-10-29T17:30:00Z', status, secretCode: 'synthetic-unused-secret' })
  const order = (id, status, tickets) => ({ id: id + '-synthetic-order', status, createdAt: '2026-10-28T08:00:00Z', totalAmount: tickets.length * 250, amountPaid: status === 'Paid' ? tickets.length * 250 : 0, pointsUsed: 0, tickets })
  const orders = () => scenario === 'empty' ? [] : scenario === 'one' ? [order('single', 'Paid', [ticket('single')])] : [
    order('paid', 'Paid', [ticket('one'), ticket('two', 'Valid', 8), ticket('refund', 'Refunded', 9)]),
    ...['Pending', 'PaymentProcessing', 'PaymentOutcomeUnknown', 'Failed', 'Expired', 'Cancelled'].map((s, i) => order(s, s, [ticket(s, 'Reserved', i + 1)])),
    order('mixed', 'Paid', [ticket('used', 'Used'), ticket('released', 'Released', 8)]),
    order('past', 'Paid', [{ ...ticket('past', 'Used'), sessionStart: '2026-10-20T17:30:00Z' }]),
    order('long', 'Paid', [{ ...ticket('long'), movieTitle: 'Коли світло згасає: надзвичайно довга українська кіноісторія про повернення додому та новий початок', posterUrl: '' }]),
  ]
  await c.addInitScript(() => {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ sub: 'synthetic-phase-seven-user', role: 'admin', firstName: 'Марія', lastName: 'Коваленко', email: 'phase-seven@example.invalid', exp: 4102444800 }))))
    localStorage.setItem('cinema_access_token', `e30.${payload}.synthetic`)
  })
  p.on('pageerror', e => errors.push(e.message))
  p.on('console', m => { if (m.type() === 'error') consoleErrors.push({scenario, message:m.text()}) })
  await c.route('**/*', async route => {
    const r = route.request(), u = new URL(r.url())
    if (u.hostname === 'placehold.co') return route.fulfill({ status: 200, contentType: 'image/jpeg', body: 'synthetic missing image' })
    if (!u.pathname.startsWith('/api/')) return route.continue()
    const send = json => route.fulfill({ json, headers: { 'Access-Control-Allow-Origin': '*' } })
    if (r.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } })
    if (r.method() !== 'GET') {
      mutations.push({ method: r.method(), path: u.pathname })
      if (scenario === 'mutation-error') return route.fulfill({status:503,json:{detail:'Synthetic save failure'}})
      return send(u.pathname.endsWith('/date-of-birth') ? { dateOfBirth: '1994-08-24' } : {})
    }
    if (hold) await gate
    if (scenario === 'error' || (scenario === 'loyalty-error' && u.pathname.endsWith('/account/loyalty'))) return route.fulfill({ status: 503, json: { message: 'Synthetic service unavailable' }, headers: { 'Access-Control-Allow-Origin': '*' } })
    if (u.pathname.endsWith('/account/profile')) return send({ id: 'synthetic-phase-seven-user', email: 'phase-seven@example.invalid', firstName: 'Марія', lastName: 'Коваленко', loyaltyPoints: 125, loyaltyTier: 'Bronze', dateOfBirth: scenario === 'no-dob' ? null : '1994-08-24' })
    if (u.pathname.endsWith('/account/loyalty')) return send({ points: scenario === 'empty' ? 0 : 125, balance: scenario === 'empty' ? 0 : 125, tier: 'Bronze', yearPoints: 125, yearVisits: 1 })
    if (u.pathname.endsWith('/orders')) return send({ activeOrders: orders(), pastOrders: [] })
    if (u.pathname.endsWith('/achievements/me')) return send({ achievements: scenario === 'empty' ? [] : [
      { achievement: { id: 'synthetic-achievement', code: 'FIRST_VISIT', name: 'Перший сеанс', description: 'Ваш перший похід у кіно.', isSecret: false, icon: '', category: 'Visits', rarity: 'Common', strategy: 'Threshold', criteriaJson: '{}', rewardPoints: 25, sortOrder: 1, isActive: true, createdAt: '2026-10-01', updatedAt: '2026-10-01' }, current: 1, target: 1, isUnlocked: true, unlockedAt: '2026-10-20' },
      { achievement: { id: 'synthetic-progress', code: 'THREE_VISITS', name: 'Ще більше кіно', description: 'Відвідайте три сеанси.', isSecret: false, icon: '', category: 'Visits', rarity: 'Common', strategy: 'Threshold', criteriaJson: '{}', rewardPoints: 50, sortOrder: 2, isActive: true, createdAt: '2026-10-01', updatedAt: '2026-10-01' }, current: 1, target: 3, isUnlocked: false },
    ] })
    return send([])
  })
  const capture = async name => {
    await p.evaluate(() => scrollTo({top:0,left:0,behavior:'instant'}))
    await p.screenshot({ path: `${output}/screenshots/phase-7/${name}.png`, fullPage: true })
    if (name.startsWith('text-200-settings')) {
      const headerStyle = await p.addStyleTag({content:'.cinema-header {visibility:hidden !important}'})
      await p.locator('.account').screenshot({path:`${output}/screenshots/phase-7/${name}-account.png`})
      await headerStyle.evaluate(e => e.remove())
    }
  }
  const ready = async () => {
    await p.getByRole('heading', { name: /Особистий|Мої квитки/ }).first().waitFor()
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))) })
    await p.waitForTimeout(350)
  }
  const geometry = async label => {
    const metrics = await p.locator('.account').evaluate(e => ({
      pageOverflow:document.documentElement.scrollWidth > innerWidth,
      surfaceOverflow:e.scrollWidth > e.clientWidth + 1,
      lenis:document.documentElement.classList.contains('lenis'),
      paper:getComputedStyle(e).backgroundColor,
      headingFont:getComputedStyle(e.querySelector('h1')).fontFamily,
      accountRight:e.getBoundingClientRect().right,viewport:innerWidth,
    }))
    check(label + ': contained paper layout and no Lenis', (!metrics.pageOverflow || label.startsWith('text-200')) && metrics.accountRight <= metrics.viewport + 1 && !metrics.surfaceOverflow && !metrics.lenis && metrics.paper === 'rgb(245, 241, 232)', metrics)
    check(label + ': correct page and no framework overlay', await p.title() === 'Cinema Platform' && await p.locator('vite-error-overlay').count() === 0)
  }
  const open = async () => { await p.goto(baseUrl + '/profile', {waitUntil:'networkidle'}); await ready() }
  const section = async name => {
    await p.getByRole('button', {name, exact:true}).click()
    await p.getByRole('heading', {level:1, name, exact:true}).waitFor()
  }
  try {
for(const motion of ['reduce','no-preference']){await p.emulateMedia({reducedMotion:motion});for(const width of [1440,768,390,320]){await p.setViewportSize({width,height:1000});await open();await section('Досягнення');await p.getByRole('heading',{name:'Ще більше кіно'}).waitFor();await geometry('achievement-detail-'+motion+'-'+width);check('API reward and numeric progress preserved '+motion+'-'+width,await p.getByText('+25 балів',{exact:true}).isVisible()&&await p.getByText('+50 балів',{exact:true}).isVisible()&&await p.getByText('1 / 3',{exact:true}).isVisible());await capture('achievements-'+motion+'-'+width);}}
return {results,errors,mutations}
} finally {await c.close()}
}
