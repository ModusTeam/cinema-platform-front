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
    for (const motion of ['reduce','no-preference']) {
      await p.emulateMedia({reducedMotion:motion})
      for (const width of [1440,768,390,320]) {
        await p.setViewportSize({width,height:1000}); await open()
        const label = motion + '-' + width
        await geometry('tickets-' + label)
        check(label + ': six active orders, closed QR absent', await p.locator('.digital-ticket').count() === 6 && await p.locator('.digital-ticket svg').count() === 0)
        check(label + ': all payment states labelled', (await p.locator('.account').innerText()).includes('Статус оплати уточнюється'))
        await capture('after-tickets-' + label)
        await p.screenshot({path:`${output}/screenshots/phase-7/viewport-${label}.png`})
        const paid = p.locator('.digital-ticket').first()
        const summary = paid.locator('summary')
        await summary.focus(); await p.keyboard.press('Enter')
        await paid.locator('svg').first().waitFor()
        check(label + ': two valid QR codes retain seats and IDs', await paid.locator('svg').count() === 2 && await paid.getByRole('heading',{name:'Місце Б-8',exact:true}).isVisible())
        check(label + ': refunded ticket has no QR', await paid.locator('[data-ticket-status="Refunded"] svg').count() === 0)
        await geometry('expanded-' + label)
        if(width === 1440 || width === 320) await capture('qr-' + label)
        await paid.getByRole('button',{name:'Згорнути квитки',exact:true}).click()
        await paid.locator('button').first().waitFor({state:'detached'})
        check(label + ': collapse restores summary focus and unmounts QR controls', await summary.evaluate(e=>e===document.activeElement) && await paid.locator('svg').count() === 0 && await paid.locator('button').count() === 0)
        for (const status of ['Pending','PaymentProcessing','PaymentOutcomeUnknown']) {
          const item = p.locator(`[data-order-status="${status}"]`)
          await item.locator('summary').click()
          check(label + ': no QR for ' + status, await item.locator('svg').count() === 0)
        }
        await section('Історія')
        check(label + ': four history orders retain terminal states', await p.locator('.digital-ticket').count() === 4)
        for (const item of await p.locator('.digital-ticket').all()) await item.locator('summary').click()
        check(label + ': used, cancelled, failed, expired expose no QR', await p.locator('.digital-ticket svg').count() === 0)
        await capture('history-' + label)
        await section('Досягнення'); await p.getByRole('heading',{name:'Перший сеанс',exact:true}).waitFor()
        check(label + ': achievement preview links to dedicated page', await p.getByRole('link',{name:'Усі досягнення ↗'}).getAttribute('href') === '/profile/achievements')
        await geometry('achievements-' + label)
        await capture('achievements-' + label)
        await section('Профіль')
        await capture('settings-' + label)
        check(label + ': established date and email are immutable', await p.getByLabel('Ваша дата',{exact:true}).isDisabled() && await p.getByLabel('Email',{exact:true}).isDisabled())
        await p.getByLabel('Ім’я',{exact:true}).fill('Синтетичне ім’я з довгою частиною')
        await section('Історія'); await section('Профіль')
        check(label + ': navigation retains unsaved settings', await p.getByLabel('Ім’я',{exact:true}).inputValue() === 'Синтетичне ім’я з довгою частиною')
        await p.getByLabel('Ім’я',{exact:true}).fill('')
        await p.getByRole('button',{name:'Зберегти зміни',exact:true}).click()
        await p.getByRole('alert').filter({hasText:"Ім'я обов'язкове"}).waitFor()
        check(label + ': invalid field announced and focused', await p.getByLabel('Ім’я',{exact:true}).getAttribute('aria-invalid') === 'true' && await p.getByLabel('Ім’я',{exact:true}).evaluate(e=>e===document.activeElement))
        await geometry('settings-' + label)
        await capture('validation-' + label)
      }
    }
    await p.emulateMedia({reducedMotion:'reduce'})
    await p.setViewportSize({width:1440,height:1000}); await open(); await section('Профіль')
    await p.getByLabel('Ім’я',{exact:true}).fill('Марія-Софія')
    await p.getByRole('button',{name:'Зберегти зміни',exact:true}).click()
    await p.getByText('Дані успішно оновлено',{exact:true}).waitFor()
    check('profile update uses existing PUT contract', mutations.some(m=>m.method==='PUT' && m.path==='/api/account/profile'))
    check('profile update synchronizes visible name', await p.locator('aside').first().innerText().then(t=>t.includes('Марія-Софія')))
    // Only synthetic passwords, cleared before any screenshot or log.
    await p.getByLabel('Новий пароль',{exact:true}).fill('synthetic-new-password')
    await p.getByLabel('Підтвердження',{exact:true}).fill('synthetic-new-password')
    await p.getByRole('button',{name:'Зберегти зміни',exact:true}).click()
    await p.getByRole('alert').filter({hasText:'Введіть поточний пароль'}).waitFor()
    check('password confirmation requires current password', await p.getByLabel('Поточний пароль',{exact:true}).getAttribute('aria-invalid')==='true')
    await p.getByLabel('Поточний пароль',{exact:true}).fill('synthetic-old-password')
    await p.getByRole('button',{name:'Зберегти зміни',exact:true}).click()
    await p.waitForFunction(()=>document.querySelector('input[name="newPassword"]')?.value==='')
    check('password change retains endpoint and clears secrets', mutations.some(m=>m.path==='/api/account/change-password') && await p.getByLabel('Поточний пароль',{exact:true}).inputValue()==='')
    await capture('settings-saved-1440')
    scenario='mutation-error'
    await p.getByLabel('Ім’я',{exact:true}).fill('Незбережене')
    await p.getByRole('button',{name:'Зберегти зміни',exact:true}).click()
    await p.getByText('Synthetic save failure',{exact:true}).waitFor()
    check('failed mutation retains entered data and reports error',await p.getByLabel('Ім’я',{exact:true}).inputValue()==='Незбережене')
    scenario='no-dob'; await open(); await section('Профіль')
    await p.getByLabel('Ваша дата',{exact:true}).fill('2999-01-01')
    await p.getByRole('alert').filter({hasText:'Дата народження не може бути в майбутньому'}).waitFor()
    check('future birth date blocks one-time save',await p.getByRole('button',{name:'Зберегти дату',exact:true}).isDisabled())
    await p.getByLabel('Ваша дата',{exact:true}).fill('1994-08-24')
    await p.getByRole('button',{name:'Зберегти дату',exact:true}).click()
    await p.waitForFunction(()=>document.querySelector('input[type="date"]')?.disabled)
    check('one-time birth date syncs and locks after save',mutations.some(m=>m.method==='PATCH' && m.path==='/api/users/me/date-of-birth'))
    await capture('birth-date-saved-1440')
    scenario='one'; await open()
    check('single paid ticket scenario',await p.locator('.digital-ticket').count()===1)
    await p.locator('.digital-ticket summary').click();await p.locator('.digital-ticket svg').waitFor()
    await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:baseUrl})
    await p.getByRole('button',{name:'Скопіювати ID квитка, місце Б-7'}).click()
    check('clipboard preserves existing QR ticket ID payload',await p.evaluate(()=>navigator.clipboard.readText())==='synthetic-ticket-single')
    await capture('single-ticket-1440')
    await p.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('Synthetic clipboard denial'))}))
    await p.getByRole('button',{name:'Скопіювати ID квитка, місце Б-7'}).click()
    await p.getByText('Не вдалося скопіювати ID. Скопіюйте його вручну.',{exact:true}).waitFor()
    check('clipboard denial reports failure rather than success',true)
    await open()
    let reached=false
    for(let i=0;i<20;i++) { await p.keyboard.press('Tab'); if(await p.getByRole('button',{name:'Мої квитки',exact:true}).evaluate(e=>e===document.activeElement)){reached=true;break} }
    check('keyboard reaches compact/desktop account navigation',reached)
    await p.keyboard.press('Tab');await p.keyboard.press('Enter')
    check('keyboard changes account section with clear active state',await p.getByRole('heading',{name:'Історія',level:1,exact:true}).isVisible() && await p.getByRole('button',{name:'Історія',exact:true}).getAttribute('aria-current')==='page')
    await p.keyboard.press('Tab');await p.keyboard.press('Tab');await p.keyboard.press('Enter')
    await p.getByLabel('Ім’я',{exact:true}).waitFor()
    reached=false
    for(let i=0;i<15;i++) { await p.keyboard.press('Tab');if(await p.getByLabel('Ім’я',{exact:true}).evaluate(e=>e===document.activeElement)){reached=true;break} }
    check('keyboard reaches settings fields without hidden disclosure controls',reached)
    await capture('keyboard-settings-1440')
    // Long synthetic name, 200% text, narrow screens; no real account is touched.
    await p.evaluate(()=>{
      const payload=btoa(unescape(encodeURIComponent(JSON.stringify({sub:'synthetic-phase-seven-user',role:'admin',firstName:'Марія-Софія-Олександра',lastName:'Коваленко-Довгополенко-Вернигора',email:'phase-seven@example.invalid',exp:4102444800}))))
      localStorage.setItem('cinema_access_token',`e30.${payload}.synthetic`)
    })
    for (const width of [1440,768,390,320]) {
      scenario='normal';await p.setViewportSize({width,height:1000});await open()
      await p.addStyleTag({content:'html { font-size: 200% !important; }'})
      await geometry('text-200-tickets-'+width)
      await p.locator('.digital-ticket summary').first().click();await p.locator('.digital-ticket svg').first().waitFor()
      await geometry('text-200-qr-'+width)
      await section('Профіль');await geometry('text-200-settings-'+width)
      await capture('text-200-settings-'+width)
    }
    scenario='empty';await p.setViewportSize({width:390,height:1000});await open()
    await p.getByRole('heading',{name:'Активних квитків немає'}).waitFor()
    check('empty tickets and zero loyalty balance',await p.getByRole('button',{name:'Переглянути афішу'}).isVisible() && await p.getByText('0 балів',{exact:true}).isVisible())
    await capture('empty-390');await section('Історія');await p.getByRole('heading',{name:'Історія замовлень порожня'}).waitFor()
    await section('Досягнення');await p.getByRole('heading',{name:'Відкритих досягнень поки немає'}).waitFor()
    await capture('empty-achievements-390')
    scenario='loyalty-error';await open()
    await p.getByText('Баланс тимчасово недоступний.',{exact:true}).filter({visible:true}).waitFor()
    check('loyalty failure leaves tickets available',await p.locator('.digital-ticket').count()===6)
    await capture('loyalty-error-390')
    scenario='error';await open()
    await p.getByRole('heading',{name:'Не вдалося завантажити дані',exact:true}).filter({visible:true}).waitFor()
    check('request failure is not empty and exposes no QR',await p.locator('.digital-ticket').count()===0 && await p.getByRole('heading',{name:'Активних квитків немає'}).count()===0)
    await capture('error-390');await section('Профіль')
    await p.getByRole('heading',{name:'Не вдалося завантажити дані',exact:true}).filter({visible:true}).waitFor()
    check('profile fetch failure prevents unsafe one-time birth-date form',await p.getByLabel('Ваша дата',{exact:true}).count()===0)
    await section('Досягнення');await p.getByRole('heading',{name:'Досягнення тимчасово недоступні'}).waitFor()
    await capture('achievements-error-390')
    scenario='normal';beginHold()
    await p.goto(baseUrl+'/profile',{waitUntil:'domcontentloaded'})
    await p.getByText('Завантажуємо замовлення…',{exact:true}).waitFor()
    check('ticket and loyalty loading states are explicit',await p.getByText('Завантажуємо баланс…',{exact:true}).filter({visible:true}).isVisible())
    await capture('loading-390');finishHold()
    await p.locator('.digital-ticket').first().waitFor()
    check('runtime error free',errors.length===0,errors)
    check('normal scenarios have no console errors',consoleErrors.filter(e=>!['error','loyalty-error','mutation-error'].includes(e.scenario)).length===0,consoleErrors)
    return {stage,results,errors,consoleErrors,mutations}
  } finally { finishHold(); await c.close() }
}
