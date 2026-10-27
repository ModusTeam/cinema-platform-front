// Isolated Playwright GET fixtures. No application runtime interception or seeding.
async (page, { baseUrl = 'http://127.0.0.1:5176', scenario = 'normal', reducedMotion = 'reduce', widths = [1440, 768, 390, 320], interactions = false } = {}) => {
  const output = 'D:/PROGRAMMINGPROJECTS/cinema-platform-front/docs/design/ui-experience-polish'
  const assets = '/docs/design/ui-experience-polish/fixtures/phase-5'
  const context = await page.context().browser().newContext({ locale: 'uk-UA', timezoneId: 'Europe/Kyiv', reducedMotion })
  const p = await context.newPage()
  const errors = [], mutations = [], results = [], requests = []
  const check = (name, passed, details) => {
    results.push({ name, passed, details })
    if (!passed) throw new Error(name + ': ' + JSON.stringify(details))
  }
  p.on('pageerror', e => errors.push(e.message))
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  p.on('request', r => requests.push(r.url()))
  await p.clock.setFixedTime(new Date('2026-10-28T09:00:00Z'))
  const description = 'Пол Атрідес об’єднується з фременами, щоб помститися змовникам, які знищили його родину. Перед ним постає вибір між коханням, обов’язком і долею всієї галактики. Коли на карту поставлено майбутнє Арракіса, Пол мусить прийняти свою нову роль і ступити на шлях, що назавжди змінить Всесвіт.'
  const normal = { id: 'film', title: 'Дюна: Частина друга', description, durationMinutes: 166, releaseYear: 2024, rating: 8.5, status: 2, genres: ['Наукова фантастика', 'Пригоди'], cast: [{name:'Тімоті Шаламе',role:'Пол Атрідес'}, {name:'Зендея',role:'Чані'}, {name:'Ребекка Фергюсон',role:'Леді Джессіка'}, {name:'Хав’єр Бардем',role:'Стілгар'}], trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w', posterUrl: assets + '/dune-poster.jpg', backdropUrl: assets + '/dune-backdrop.jpg' }
  const movie = scenario === 'sparse' ? {...normal,posterUrl:null,backdropUrl:null,cast:[],trailerUrl:null,rating:0,genres:[]} : scenario === 'long' ? {...normal,title:'Дюна: Частина друга — спеціальний показ оригінальної режисерської версії українською мовою',description:Array(5).fill(description).join('\n\n'),cast:[...normal.cast,{name:'Олександра-Марія Костянтинівна Кінолюбителька',role:'Мандрівниця далекими незвіданими світами'},{name:'Ївга Ґалаґан',role:null}]} : normal
  const others = [
    {...normal,id:'arrival',title:'Прибуття',releaseYear:2016,posterUrl:assets+'/arrival-backdrop.jpg',backdropUrl:assets+'/arrival-backdrop.jpg'},
    {...normal,id:'dune',title:'Дюна',releaseYear:2021,backdropUrl:assets+'/dune-backdrop.jpg'},
  ]
  const catalogue = scenario === 'sparse' ? [movie] : [movie, ...others, others[0], {...normal,id:'archived',status:3}, {...normal,id:'deleted',deletedAt:'2026-01-01'}]
  const paginated = items => ({items,pageNumber:1,totalPages:1,totalCount:items.length})
  const future = {id:'future',movieId:'film',movieTitle:movie.title,hallId:'hall',hallName:'Великий зал',startTime:'2026-10-29T16:00:00Z',endTime:'2026-10-29T18:46:00Z',status:'Scheduled'}
  await context.route('**/*', route => {
    const r = route.request(), u = new URL(r.url())
    if (u.hostname.endsWith('youtube.com')) return route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="uk"><title>Fixture player</title><body><button>Відтворити відео (fixture)</button></body></html>'})
    if (u.pathname.startsWith('/api/')) {
      if (r.method() !== 'GET') { mutations.push(u.pathname); return route.abort() }
      const headers = {'Access-Control-Allow-Origin':'*'}
      if (u.pathname.endsWith('/movies')) return route.fulfill({json:paginated(catalogue),headers})
      if (u.pathname.includes('/movies/')) {
        const id = u.pathname.split('/').at(-1)
        return route.fulfill({json:id === 'film' ? movie : others.find(m=>m.id===id) ?? normal,headers})
      }
      if (u.pathname.endsWith('/sessions')) return route.fulfill({json:paginated([
        {...future,id:'past',startTime:'2026-10-25T16:00:00Z'},
        ...(scenario === 'sparse' ? [] : [future, {...future,id:'cancelled',status:'Cancelled'}, {...future,id:'other',movieId:'other'}]),
      ]),headers})
      if (u.pathname.endsWith('/halls')) return route.fulfill({json:paginated([]),headers})
      return route.fulfill({json:[],headers})
    }
    if (u.origin !== baseUrl) return route.fulfill({status:204})
    return route.continue()
  })
  const capture = name => p.screenshot({path:output+'/screenshots/phase-5/'+name+'.png',fullPage:true})
  const open = async () => {
    await p.goto(baseUrl+'/movies/film',{waitUntil:'networkidle'})
    await p.locator('h1').waitFor()
    await p.locator('[aria-labelledby="movie-discover"] .movie-discover-link, [aria-labelledby="movie-discover"] .movie-state').first().waitFor()
    await p.evaluate(async () => {
      await document.fonts.ready
      const images = [...document.images]
      images.forEach(i=>i.loading='eager')
      await Promise.all(images.map(i=>i.decode().catch(()=>{})))
    })
    await p.waitForTimeout(500)
  }
  try {
    for (const width of widths) {
      await p.setViewportSize({width,height:width>=768?1000:844})
      await open()
      const prefix = scenario+'-'+(reducedMotion==='reduce'?'reduced':'motion')+'-'+width
      const geometry = await p.evaluate(() => ({
        overflow:document.documentElement.scrollWidth>innerWidth,
        lenis:document.documentElement.classList.contains('lenis'),
        header:getComputedStyle(document.querySelector('header')).backgroundColor,
        heading:document.querySelector('h1').getBoundingClientRect().toJSON(),
        hero:document.querySelector('.movie-hero').getBoundingClientRect().toJSON(),
        titleFont:getComputedStyle(document.querySelector('h1')).fontFamily,
        bodyFont:getComputedStyle(document.querySelector('.movie-description')).fontFamily,
        paper:getComputedStyle(document.querySelector('.movie-paper')).backgroundColor,
        poster:!!document.querySelector('.movie-poster'),
        links:[...document.querySelectorAll('.movie-discover-link')].map(e=>e.getAttribute('href')),
      }))
      check(prefix+' identity and clean layout',await p.title()==='Cinema Platform' && await p.locator('h1').textContent()===movie.title && !geometry.overflow && !geometry.lenis && await p.locator('vite-error-overlay').count()===0,geometry)
      check(prefix+' deferred trailer',await p.locator('iframe').count()===0 && !requests.some(u=>u.includes('youtube.com')),null)
      check(prefix+' real supported data',await p.locator('.movie-poster').count()===(scenario==='sparse'?0:1) && geometry.links.length===(scenario==='sparse'?0:2),null)
      if (scenario==='sparse') {
        check(prefix+' honest empty states',await p.getByText('Нових сеансів поки немає',{exact:true}).isVisible() && await p.getByText('Ще більше кіно попереду',{exact:true}).isVisible() && await p.locator('#movie-trailer').count()===0,null)
      } else {
        check(prefix+' future scheduled only',await p.locator('[aria-labelledby="movie-screenings"] time').count()===1 && await p.locator('time').getAttribute('datetime')===future.startTime,null)
      }
      // Scroll the reveal into view before the full-page capture.
      await p.locator('#movie-about').scrollIntoViewIfNeeded()
      await p.waitForTimeout(reducedMotion==='reduce'?50:550)
      await p.evaluate(()=>scrollTo(0,0))
      await capture('after-'+prefix)
    }
    if (interactions && scenario==='normal') {
      await p.setViewportSize({width:390,height:844});await open()
      const booking=p.getByRole('button',{name:'Купити квиток',exact:true}).first()
      await booking.focus();await p.keyboard.press('Tab');await p.keyboard.press('Shift+Tab')
      check('ticket keyboard focus',await booking.evaluate(e=>e.matches(':focus-visible')&&getComputedStyle(e).outlineWidth==='2px'),null)
      await booking.press('Enter');await p.waitForURL('**/auth/login')
      check('guest booking return path',await p.evaluate(()=>history.state?.usr?.from)==='/booking/film',await p.evaluate(()=>history.state))
      await open()
      await p.getByRole('link',{name:'Трейлер',exact:true}).click()
      check('trailer anchor clears fixed header',await p.locator('#movie-trailer').evaluate(e=>e.getBoundingClientRect().top>=80),null)
      await p.getByRole('button',{name:/Дивитися трейлер:/}).press('Enter')
      await p.locator('iframe').waitFor()
      check('trailer loads on activation and receives focus',await p.locator('iframe').getAttribute('src')==='https://www.youtube.com/embed/Way9Dexny3w' && await p.locator('iframe').evaluate(e=>e===document.activeElement),null)
      await capture('trailer-active-390')
      await p.locator('.movie-discover-link[href="/movies/arrival"]').click()
      await p.waitForURL('**/movies/arrival')
      await p.waitForFunction(() => document.querySelector('h1')?.textContent === 'Прибуття')
      check('discover navigates and resets trailer',await p.locator('h1').textContent()==='Прибуття' && await p.locator('iframe').count()===0,null)
      await p.getByRole('button',{name:'Відкрити меню',exact:true}).click()
      check('Phase 4 menu over paper remains functional',await p.getByRole('dialog',{name:'Головне меню'}).isVisible(),null)
      await p.keyboard.press('Escape')
      check('menu close restores page',await p.getByRole('dialog').count()===0 && await p.evaluate(()=>document.body.style.overflow!=='hidden'),null)
      await p.evaluate(() => localStorage.setItem('cinema_access_token','e30.'+btoa(JSON.stringify({sub:'fixture-user',email:'fixture@example.test',exp:1999999999,role:'User'}))+'.fixture'))
      await open();await p.getByRole('button',{name:'Купити квиток',exact:true}).first().click()
      await p.waitForURL('**/booking/film')
      check('authenticated booking keeps movie route without session preselection',new URL(p.url()).pathname==='/booking/film' && new URL(p.url()).search==='',null)
    }
    check('console health',errors.length===0,errors)
    check('no backend mutations',mutations.length===0,mutations)
    return {scenario,reducedMotion,browser:context.browser().version(),results,errors,mutations}
  } finally {await context.close()}
}
