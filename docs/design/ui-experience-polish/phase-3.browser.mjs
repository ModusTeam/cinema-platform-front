// Temporary browser verification. Run through Playwright MCP against Vite :5174.
// Read-only API fixtures; no production imports and no backend required.
async (page, { probe = false, hasTouch = true } = {}) => {
  const baseUrl = 'http://127.0.0.1:5174'
  const outputDir = 'D:/PROGRAMMINGPROJECTS/cinema-platform-front/docs/design/ui-experience-polish/screenshots/phase-3'
  const context = await page.context().browser().newContext({
    locale: 'uk-UA', timezoneId: 'Europe/Kyiv', hasTouch,
    reducedMotion: 'no-preference',
  })
  const p = await context.newPage()
  const results = [], errors = [], mutations = [], expectedErrors = []
  let state = 'ready'
  const check = (name, passed, details) => {
    results.push({ name, passed, details })
    if (!passed) throw new Error(`${name}: ${JSON.stringify(details)}`)
  }
  p.on('pageerror', e => errors.push(e.message))
  p.on('console', m => {
    if (m.type() === 'error') (['error','lenis-unavailable'].includes(state) ? expectedErrors : errors).push(m.text())
  })
  // Track virtual-scroll listeners to catch StrictMode duplicates and exit leaks.
  await context.addInitScript(() => {
    window.__wheelListeners = new Set()
    const add = window.addEventListener.bind(window)
    const remove = window.removeEventListener.bind(window)
    window.addEventListener = (type, callback, options) => {
      if (type === 'wheel') window.__wheelListeners.add(callback)
      return add(type, callback, options)
    }
    window.removeEventListener = (type, callback, options) => {
      if (type === 'wheel') window.__wheelListeners.delete(callback)
      return remove(type, callback, options)
    }
    window.__layoutShifts = []
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__layoutShifts.push(entry.value)
    }).observe({ type: 'layout-shift', buffered: true })
  })
  // Keep catalogue dates deterministic without replacing rAF/performance clocks.
  // Playwright's clock shim desynchronizes WAAPI's document timeline in this browser.
  await context.addInitScript(() => {
    const NativeDate = Date, fixed = NativeDate.parse('2026-10-26T09:00:00Z')
    window.Date = class extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [fixed])) }
      static now() { return fixed }
    }
  })
  await p.goto(`${baseUrl}/docs/design/ui-experience-polish/lab/index.html`)
  const fixture = await p.evaluate(async () => {
    const f = await import('/src/app/design-lab/fixtures.ts')
    return { movie: f.movieFixture, longTitle: f.longTitle }
  })
  const movies = [fixture.movie, { ...fixture.movie, id: 'film-long', title: fixture.longTitle }]
  const paginated = items => ({ items, pageNumber: 1, totalPages: 1, totalCount: items.length })
  await context.route('**/*', async route => {
    const r = route.request(), url = new URL(r.url())
    if(state==='lenis-unavailable' && url.pathname.endsWith('/SmoothDocumentScroll.tsx')) return route.abort()
    if (r.isNavigationRequest()) return route.continue()
    if (['xhr', 'fetch'].includes(r.resourceType()) && !url.pathname.startsWith('/src/')) {
      if (r.method() !== 'GET') { mutations.push(url.pathname); return route.abort() }
      if (state === 'loading') await new Promise(resolve => setTimeout(resolve, 1800))
      const headers = { 'Access-Control-Allow-Origin': '*' }
      if (state === 'error') return route.fulfill({ status: 503, json: { message: 'Fixture unavailable' }, headers })
      if (url.pathname.endsWith('/movies')) return route.fulfill({ json: paginated(state === 'empty' ? [] : movies), headers })
      if (url.pathname.endsWith('/sessions')) return route.fulfill({ json: paginated(movies.flatMap(movie => [16,19,21].map((hour,i) => ({
        id: `${movie.id}-${i}`, movieId: movie.id, movieTitle: movie.title,
        hallId: 'hall', hallName: 'Зал 1', status: 'Scheduled', price: 250,
        startTime: `2026-10-26T${hour-2}:30:00Z`, endTime: `2026-10-26T${hour}:49:00Z`,
      })))), headers })
      if (url.pathname.endsWith('/halls')) return route.fulfill({ json: paginated([{ id:'hall', name:'Зал 1', totalCapacity:80, technologies:[{id:'atmos',name:'Dolby Atmos'}] }]), headers })
      return route.fulfill({ json: [], headers })
    }
    if (url.origin !== baseUrl) return route.fulfill({ status:204 })
    return route.continue()
  })
  const capture = (name, fullPage = false) => p.screenshot({ path:`${outputDir}/phase-3-${name}.png`, fullPage, animations:'allow' })
  const home = async () => {
    await p.goto(baseUrl, {waitUntil:'networkidle'})
    await p.locator('h1').waitFor()
    await p.evaluate(() => document.fonts.ready)
    await p.waitForTimeout(500)
  }
  const metrics = () => p.evaluate(() => ({
    y:scrollY, lenis:document.documentElement.classList.contains('lenis'),
    wheelListeners:window.__wheelListeners.size,
    depth:document.querySelector('.cinema-hero-depth') && getComputedStyle(document.querySelector('.cinema-hero-depth')).transform,
    heading:document.querySelector('.home-programme-heading') && getComputedStyle(document.querySelector('.home-programme-heading')).transform,
    overflow:document.documentElement.scrollWidth>innerWidth,
    overlay:!!document.querySelector('vite-error-overlay'),
  }))
  try {
    if(probe) {
      await p.setViewportSize({width:1440,height:1000});await home()
      const layoutShiftSum=await p.evaluate(()=>window.__layoutShifts.reduce((sum,value)=>sum+value,0))
      const ticket=p.getByRole('button',{name:'Купити квиток',exact:true})
      await ticket.hover();await p.waitForTimeout(250)
      const hover=await ticket.evaluate(el=>getComputedStyle(el).transform)
      await capture('ticket-hover-1440')
      await p.mouse.down();await p.waitForTimeout(250)
      const press=await ticket.evaluate(el=>getComputedStyle(el).transform)
      await capture('ticket-press-1440')
      await p.mouse.move(700,500);await p.mouse.up()
      await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(300)
      await ticket.hover();await p.waitForTimeout(250)
      const reduced=await ticket.evaluate(el=>getComputedStyle(el).transform)
      check('ticket hover lift',hover==='matrix(1, 0, 0, 1, 0, -2)',hover)
      check('ticket press',press==='matrix(0.98, 0, 0, 0.98, 0, 0)',press)
      check('ticket reduced motion',reduced==='none',reduced)
      return {results,layoutShiftSum,errors,mutations}
    }
    for (const preference of ['no-preference','reduce']) {
      await p.emulateMedia({reducedMotion:preference})
      const label = preference === 'reduce' ? 'reduced' : 'motion'
      for (const width of [1440,768,390,320]) {
        await p.setViewportSize({width,height:width===1440?1000:844})
        await home()
        await capture(`${label}-home-${width}`)
        if(label==='motion' && width===1440) results.push({name:'initial Home performance observation',passed:true,details:await p.evaluate(()=>({
          imageResources:performance.getEntriesByType('resource').filter(e=>e.initiatorType==='img').map(e=>({url:new URL(e.name).pathname,duration:e.duration})),
          layoutShiftSum:window.__layoutShifts.reduce((sum,value)=>sum+value,0),
        }))})
        const m = await metrics()
        check(`${label} ${width} identity/layout`, !m.overflow && !m.overlay && p.url()===`${baseUrl}/`, { ...m, title:await p.title() })
        check(`${label} ${width} Lenis scope`, m.lenis===(preference==='no-preference') && m.wheelListeners===(preference==='no-preference'?1:0),m)
        const control = p.locator('button[aria-label^="Показати фільм"]').filter({visible:true}).nth(1)
        await control.click()
        await p.waitForTimeout(550)
        const long = await p.locator('h1').evaluate(el => {
          const title=el.getBoundingClientRect(), hero=el.closest('section').getBoundingClientRect()
          const action=el.closest('section').querySelector('.ticket-action').getBoundingClientRect()
          return {text:el.textContent, titleBottom:title.bottom, actionTop:action.top, heroBottom:hero.bottom, size:getComputedStyle(el).fontSize, clipped:getComputedStyle(el).overflowY==='hidden' && el.scrollHeight>el.clientHeight+1}
        })
        check(`${label} ${width} full long title`, long.text===fixture.longTitle && !long.clipped && long.actionTop>long.titleBottom && long.heroBottom>long.actionTop,long)
        await capture(`${label}-long-${width}`,true)
        const ticket=p.getByRole('button',{name:'Купити квиток',exact:true})
        await ticket.focus()
        await p.keyboard.press('Shift+Tab')
        await p.keyboard.press('Tab')
        const focus=await ticket.evaluate(el=>({focused:el===document.activeElement,outline:getComputedStyle(el).outlineWidth,mask:getComputedStyle(el).maskImage,height:el.getBoundingClientRect().height}))
        check(`${label} ${width} ticket keyboard focus`,focus.focused && focus.outline==='2px' && focus.mask==='none' && focus.height>=44,focus)
      }
    }
    await p.emulateMedia({reducedMotion:'no-preference'})
    await p.setViewportSize({width:1440,height:1000})
    await home()
    await p.goto(baseUrl+'/#home-programme',{waitUntil:'networkidle'})
    await p.waitForTimeout(500)
    const deepAnchor=await p.locator('#home-programme').evaluate(el=>el.getBoundingClientRect().top)
    check('direct Home hash entry',Math.abs(deepAnchor-112)<4,{top:deepAnchor})
    await home()
    const pause = p.getByRole('button',{name:'Призупинити автоматичну зміну фільмів'})
    await pause.click()
    check('autoplay explicit pause',await p.getByRole('button',{name:'Відновити автоматичну зміну фільмів'}).isVisible())
    await p.mouse.move(700,650)
    const select=p.locator('button[aria-label^="Показати фільм"]').filter({visible:true}).nth(1)
    await select.evaluate(el=>el.click())
    const filmFrames=[]
    for (const [index,delay] of [0,100,500].entries()) {
      if(delay) await p.waitForTimeout(delay)
      filmFrames.push(await p.locator('.cinema-hero-image').evaluateAll(els=>els.map(el=>({opacity:getComputedStyle(el).opacity,src:el.getAttribute('src')}))))
      await capture(`film-frame-${index}`)
    }
    check('film crossfade finishes',filmFrames[2].length===1 && Number(filmFrames[2][0].opacity)===1,filmFrames)
    // Restore short film for scroll progress comparisons.
    await p.locator('button[aria-label^="Показати фільм"]').filter({visible:true}).first().evaluate(el=>el.click())
    await p.waitForTimeout(550)
    await p.mouse.move(700,500)
    const samples=[await metrics()]
    await p.mouse.wheel(0,620)
    for (const [index,delay] of [40,120,800].entries()) {
      await p.waitForTimeout(delay)
      samples.push(await metrics())
      await capture(`scroll-frame-${index}`)
    }
    check('wheel smoothing and scroll-driven depth', samples[1].y>0 && samples[1].y<samples[3].y && Math.abs(samples[3].y-620)<3 && samples[0].depth!==samples[3].depth,samples)
    check('programme reveal progresses',samples[0].heading!==samples[3].heading,samples)
    await p.keyboard.press('Home'); await p.waitForTimeout(500)
    check('keyboard Home', (await metrics()).y<3, await metrics())
    await p.keyboard.press('PageDown'); await p.waitForTimeout(500)
    check('keyboard PageDown', (await metrics()).y>100, await metrics())
    // Same-page native hash keeps URL, focus, and history semantics.
    await p.locator('a[href="#home-programme"]').evaluate(el=>el.click())
    await p.waitForTimeout(500)
    const anchor=await p.locator('#home-programme').evaluate(el=>({focused:el===document.activeElement,top:el.getBoundingClientRect().top}))
    check('native anchor URL and target',p.url().endsWith('#home-programme') && anchor.focused && Math.abs(anchor.top-112)<4,anchor)
    await p.goBack(); await p.waitForTimeout(500)
    check('same-page anchor Back',!p.url().includes('#'),await metrics())
    // Mid-inertia keyboard navigation must not resume the previous wheel target.
    await p.keyboard.press('Home'); await p.waitForTimeout(400)
    await p.mouse.wheel(0,400); await p.waitForTimeout(30); await p.keyboard.press('Home'); await p.waitForTimeout(700)
    check('keyboard interrupts inertia',(await metrics()).y<3,await metrics())
    // A real nested overflow panel should scroll without moving the document.
    await p.evaluate(()=>{
      const panel=document.createElement('div'); panel.id='qa-nested';panel.style='position:fixed;z-index:100;left:40px;top:180px;width:220px;height:160px;overflow:auto;background:var(--bg-card)'
      const content=document.createElement('div');content.style.height='1000px';content.textContent='Nested scroll fixture';panel.append(content);document.body.append(panel)
    })
    await p.mouse.move(120,240); await p.mouse.wheel(0,240);await p.waitForTimeout(500)
    const nested=await p.evaluate(()=>({panel:document.getElementById('qa-nested').scrollTop,page:scrollY}))
    check('nested native wheel',nested.panel>100 && nested.page<3,nested)
    await p.evaluate(()=>document.getElementById('qa-nested').remove())
    await p.mouse.move(700,500);await p.mouse.wheel(0,500);await p.waitForTimeout(800)
    const homeY=(await metrics()).y
    await p.locator('a[href="/sessions"]').first().evaluate(el=>el.click())
    await p.waitForURL('**/sessions');await p.waitForTimeout(500)
    check('Home exit cleanup',!(await metrics()).lenis && (await metrics()).wheelListeners===0,await metrics())
    await p.goBack();await p.locator('h1').waitFor();await p.waitForTimeout(700)
    check('Back restores Home scroll',(await metrics()).lenis && Math.abs((await metrics()).y-homeY)<5,{expected:homeY,...await metrics()})
    await p.goForward();await p.waitForTimeout(500)
    check('Forward removes Lenis',!(await metrics()).lenis && (await metrics()).wheelListeners===0,await metrics())
    // Route churn checks the same document rather than hiding leaks via reloads.
    for(let i=0;i<3;i++) {
      await p.goBack();await p.waitForTimeout(500)
      check(`StrictMode reentry ${i}`, (await metrics()).wheelListeners===1,await metrics())
      await p.goForward();await p.waitForTimeout(400)
      check(`route cleanup ${i}`, (await metrics()).wheelListeners===0,await metrics())
    }
    await home()
    await p.mouse.move(700,500);await p.mouse.wheel(0,200);await p.waitForTimeout(40)
    await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(400)
    const reduced=await metrics()
    check('runtime reduce destroys Lenis',!reduced.lenis && reduced.wheelListeners===0 && reduced.depth==='none',reduced)
    await p.mouse.wheel(0,200);await p.waitForTimeout(200)
    check('native scrolling after reduction',(await metrics()).y>reduced.y,await metrics())
    await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(400)
    check('runtime normal mounts once',(await metrics()).wheelListeners===1,await metrics())
    // CDP touch gestures exercise actual native scrolling (syncTouch is false).
    await p.setViewportSize({width:390,height:844});await home()
    const cdp=await context.newCDPSession(p)
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:650}]})
    for(const y of [580,500,420,340]) {await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y}]});await p.waitForTimeout(30)}
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(500)
    check('native touch scrolling', (await metrics()).y>100 && (await metrics()).depth==='none',await metrics())
    await capture('touch-390')
    await cdp.detach()
    await home()
    const bookingEntries=[]
    const trackBooking=frame=>{if(frame===p.mainFrame()) bookingEntries.push(new URL(frame.url()).pathname)}
    p.on('framenavigated',trackBooking)
    await p.getByRole('button',{name:'Купити квиток',exact:true}).click()
    await p.waitForURL('**/auth/login')
    await p.waitForTimeout(400)
    p.off('framenavigated',trackBooking)
    check('ticket preserves booking movie route and auth guard',bookingEntries.includes(`/booking/${fixture.movie.id}`) && !(await metrics()).lenis,{bookingEntries,url:p.url(),...await metrics()})
    for(const path of ['/auth/login','/profile','/account/loyalty','/admin','/about']) {
      await p.goto(baseUrl+path,{waitUntil:'networkidle'})
      const redirectsHome=new URL(p.url()).pathname==='/'
      check(`excluded route ${path}`,redirectsHome || (!(await metrics()).lenis && (await metrics()).wheelListeners===0),{renderedPath:new URL(p.url()).pathname,...await metrics()})
    }
    state='lenis-unavailable'
    await home()
    check('optional Lenis load failure keeps Home',!(await metrics()).lenis && await p.locator('h1').isVisible(),await metrics())
    await p.mouse.move(200,500);await p.mouse.wheel(0,250);await p.waitForTimeout(400)
    check('native scroll without Lenis',(await metrics()).y>100,await metrics())
    state='ready'
    // Exercise the actual protected admin route with a synthetic local identity.
    await p.evaluate(()=>{
      const encode=value=>btoa(JSON.stringify(value))
      localStorage.setItem('cinema_access_token',`${encode({alg:'none'})}.${encode({sub:'fixture-admin',email:'fixture@example.test',role:'Admin'})}.fixture`)
    })
    await p.goto(baseUrl+'/admin/movies',{waitUntil:'networkidle'})
    check('authenticated admin remains native',new URL(p.url()).pathname==='/admin/movies' && !(await metrics()).lenis && (await metrics()).wheelListeners===0,await metrics())
    await p.evaluate(()=>localStorage.removeItem('cinema_access_token'))
    await p.setViewportSize({width:320,height:844})
    for(const next of ['empty','loading','error']) {
      state=next
      await p.goto(baseUrl,{waitUntil:next==='loading'?'domcontentloaded':'networkidle'})
      if(next==='empty') await p.getByText('Афіша скоро поповниться').waitFor()
      if(next==='loading') await p.locator('main .animate-spin').first().waitFor()
      if(next==='error') await p.getByRole('button',{name:'Спробувати ще раз'}).waitFor()
      await capture(next+'-320',true)
      check(`Home ${next} state`,!(await metrics()).overflow,await metrics())
      if(next==='error') {
        state='ready'
        await p.getByRole('button',{name:'Спробувати ще раз'}).click()
        await p.locator('#home-programme a[href^="/movies/"]').first().waitFor()
        check('failed catalogue retry recovers',await p.locator('#home-programme a[href^="/movies/"]').count()>0)
      }
    }
    check('no unexpected browser errors',errors.length===0,errors)
    check('zero mutations',mutations.length===0,mutations)
    return { results, errors, expectedErrors, mutations }
  } catch(error) {
    await capture('failure',true)
    return { failure:String(error),results,errors,expectedErrors,mutations }
  } finally {await context.close()}
}
