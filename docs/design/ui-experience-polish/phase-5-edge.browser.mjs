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

  let state='loading'
  await context.route(url=>url.pathname==='/api/movies' || url.pathname==='/api/sessions',async route=>{
    const u=new URL(route.request().url()),headers={'Access-Control-Allow-Origin':'*'}
    if(state==='loading') await p.waitForTimeout(1200)
    if(state==='error') return route.fulfill({status:503,json:{message:'Fixture unavailable'},headers})
    if(u.pathname.endsWith('/movies')) return route.fulfill({json:paginated(state==='empty'?[]:state==='one'?[normal,others[0]]:[normal,...others]),headers})
    return route.fulfill({json:paginated([future]),headers})
  })
  const open = async()=>{await p.goto(baseUrl+'/movies/film',{waitUntil:'domcontentloaded'});await p.locator('h1').waitFor()}
  const capture = name => p.screenshot({path:output+'/screenshots/phase-5/'+name+'.png',fullPage:true})
  try {
    await p.setViewportSize({width:390,height:844})
    await open()
    await p.getByText('Перевіряємо розклад…',{exact:true}).waitFor()
    check('independent loading states',await p.getByText('Завантажуємо інші фільми…',{exact:true}).isVisible(),null)
    await p.locator('.movie-discover-link').first().waitFor()
    state='error';await open()
    await p.getByText('Не вдалося завантажити інші фільми',{exact:true}).waitFor()
    check('request failures never masquerade as empty data',await p.getByText('Не вдалося перевірити розклад',{exact:true}).isVisible() && await p.getByText('Ще більше кіно попереду',{exact:true}).count()===0,null)
    await capture('error-390')
    state='ready'
    await p.locator('[aria-labelledby="movie-screenings"]').getByRole('button',{name:'Спробувати ще раз'}).click()
    await p.locator('[aria-labelledby="movie-discover"]').getByRole('button',{name:'Спробувати ще раз'}).click()
    await p.locator('.movie-discover-link').first().waitFor()
    check('both failed sections recover with retry',await p.locator('time').count()===1 && await p.locator('.movie-discover-link').count()===2,null)
    state='empty';await open()
    await p.getByText('Ще більше кіно попереду',{exact:true}).waitFor()
    check('zero-film catalogue',await p.locator('.movie-discover-link').count()===0,null)
    state='one';await open()
    await p.locator('.movie-discover-link').waitFor()
    check('one-other-film catalogue',await p.locator('.movie-discover-link').count()===1,null)
    await capture('single-discover-390')
    state='ready';await open()
    for(const width of [1440,768,390,320]){
      await p.setViewportSize({width,height:1000});await p.evaluate(()=>document.documentElement.style.fontSize='200%')
      const size=await p.locator('.movie-details').evaluate(e=>({scroll:e.scrollWidth,client:e.clientWidth}))
      check('200 percent text within movie column '+width,size.scroll<=size.client,size)
    }
    await capture('text-200-320')
    const enlarged=await p.evaluate(()=>({pageWidth:document.documentElement.scrollWidth,viewport:innerWidth,affected:[...document.querySelectorAll('header *, footer *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,text:e.textContent?.slice(0,40)})).slice(0,12)}))
    await p.evaluate(()=>document.documentElement.style.fontSize='')
    await p.setViewportSize({width:1440,height:1000})
    await p.locator('#movie-about').scrollIntoViewIfNeeded();await p.waitForTimeout(600)
    check('solid dark header over paper',await p.locator('header').getAttribute('data-header-surface')==='solid',null)
    // Hover motion is local; changing the OS preference removes it immediately.
    const link=p.locator('.movie-discover-link').first();await link.scrollIntoViewIfNeeded();await p.emulateMedia({reducedMotion:'no-preference'});await link.hover();await p.waitForTimeout(500)
    const hover=await link.locator('img').evaluate(e=>getComputedStyle(e).transform)
    await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100)
    const reduced=await link.locator('img').evaluate(e=>getComputedStyle(e).transform)
    check('reduced motion disables discovery image movement',hover!=='none'&&reduced==='none',{hover,reduced})
    const luminance=hex=>{const rgb=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722}
    const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
    const contrasts={paperBody:contrast('201f1d','f5f1e8'),paperMuted:contrast('686259','f5f1e8'),action:contrast('ffffff','c52f3a')}
    check('paper and action text contrast',Object.values(contrasts).every(v=>v>=4.5),contrasts)
    return {results,errors,mutations,enlarged,contrasts,note:'Console errors here are expected fixture 503 responses and existing service logging. No real API mutations.'}
  }finally{await context.close()}
}
