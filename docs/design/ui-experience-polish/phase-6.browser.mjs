// Pass this complete function to Playwright's code tool. Disposable GET fixtures only.
async (page) => {
  const output = 'D:/PROGRAMMINGPROJECTS/cinema-platform-front/docs/design/ui-experience-polish'
  const baseUrl = 'http://127.0.0.1:5176'
  const assets = '/docs/design/ui-experience-polish/fixtures/phase-5'
  const results = [], errors = [], requests = [], mutations = []
  const check = (name, passed, details) => {
    results.push({name, passed, details})
    if (!passed) throw new Error(name + ': ' + JSON.stringify(details))
  }
  const base = { id:'film',title:'Дюна: Частина друга',description:'Пол Атрідес повертається на Арракіс.',durationMinutes:166,releaseYear:2024,rating:8.5,status:2,genres:['Фантастика','Пригоди'],posterUrl:assets+'/dune-poster.jpg',backdropUrl:assets+'/dune-backdrop.jpg' }
  const normal = [base,{...base,id:'arrival',title:'Прибуття',releaseYear:2016,durationMinutes:116,posterUrl:assets+'/arrival-backdrop.jpg'}, {...base,id:'long',title:'Коли світло згасає: надзвичайно довга українська назва кіноісторії про повернення додому'}, {...base,id:'soon',title:'Новий сезон',status:1,posterUrl:null,backdropUrl:null}, {...base,id:'failed-image',title:'Історія без постера',posterUrl:'/fixture-missing-poster.jpg'}, {...base,id:'archive',status:3}, {...base,id:'deleted',deletedAt:'2026-01-01'}]
  const one = [{...base,posterUrl:null,backdropUrl:null,genres:[],rating:0}]
  const c = await page.context().browser().newContext({locale:'uk-UA',timezoneId:'Europe/Kyiv',reducedMotion:'reduce'})
  const p = await c.newPage()
  p.on('pageerror',e=>errors.push(e.message))
  p.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
  await p.clock.setFixedTime(new Date('2026-10-28T09:00:00Z'))
  let scenario = 'normal'
  await c.route('**/*',route=>{
    const r=route.request(),u=new URL(r.url())
    if(u.pathname==='/fixture-missing-poster.jpg') return route.fulfill({status:200,contentType:'image/jpeg',body:'invalid image fixture'})
    if(!u.pathname.startsWith('/api/')) return route.continue()
    if(r.method()!=='GET'){mutations.push(u.pathname);return route.abort()}
    requests.push(u.pathname+u.search)
    const headers={'Access-Control-Allow-Origin':'*'}
    if(u.pathname==='/api/movies'){
      const records=scenario==='one'?one:normal
      return route.fulfill({json:{items:records,pageNumber:1,totalPages:1,totalCount:records.length,hasNextPage:false},headers})
    }
    if(u.pathname.startsWith('/api/movies/')) return route.fulfill({json:normal.find(m=>m.id===u.pathname.split('/').at(-1))??base,headers})
    if(u.pathname==='/api/sessions/by-date'){
      const sessions=[{id:'a',movieId:'film',movieTitle:base.title,hallId:'h',hallName:'Великий зал',startTime:'2026-10-28T16:00:00Z',endTime:'2026-10-28T18:46:00Z',status:'Scheduled'},{id:'b',movieId:'film',movieTitle:base.title,hallId:'h',hallName:'Малий зал',startTime:'2026-10-28T19:00:00Z',status:'Scheduled'},{id:'c',movieId:'arrival',movieTitle:'Прибуття',hallId:'h',hallName:'Зал з надзвичайно довгою українською назвою',startTime:'2026-10-28T18:00:00Z',status:'Scheduled'}, {id:'past',movieId:'film',movieTitle:base.title,startTime:'2026-10-28T08:00:00Z',status:'Scheduled'},{id:'cancelled',movieId:'film',movieTitle:base.title,startTime:'2026-10-28T17:00:00Z',status:'Cancelled'}]
      return route.fulfill({json:sessions.filter(s=>s.startTime.startsWith(u.searchParams.get('date'))),headers})
    }
    return route.fulfill({json:{items:[],pageNumber:1,totalPages:1,totalCount:0},headers})
  })
  const capture = name => p.screenshot({path:output+'/screenshots/phase-6/'+name+'.png',fullPage:true})
  const ready = async () => {
    await p.locator('.catalogue h1').waitFor()
    await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{})}))})
    await p.waitForTimeout(250)
  }
  const geometry = () => p.locator('.catalogue').evaluate(e=>{
    const r=e.getBoundingClientRect()
    return {width:innerWidth,pageOverflow:document.documentElement.scrollWidth>innerWidth,surfaceOverflow:e.scrollWidth>e.clientWidth+1,outside:[...e.querySelectorAll('*')].filter(x=>{const b=x.getBoundingClientRect();return b.width>0&&(b.right>r.right+1||b.left<r.left-1)}).map(x=>x.tagName+'.'+x.className).slice(0,10),lenis:document.documentElement.classList.contains('lenis'),titleFont:getComputedStyle(e.querySelector('h1')).fontFamily,paper:getComputedStyle(e).backgroundColor}
  })
  try {
    for(const mode of ['reduce','no-preference']){
      await p.emulateMedia({reducedMotion:mode})
      for(const width of [1440,768,390,320]){
        await p.setViewportSize({width,height:1000})
        await p.goto(baseUrl+'/sessions',{waitUntil:'networkidle'});await ready()
        for(const view of ['posters','index']){
          await p.getByRole('button',{name:view==='posters'?'Постери':'Індекс',exact:true}).click();await p.waitForTimeout(220)
          const name='after-'+view+'-'+mode+'-'+width,g=await geometry()
          check(name+' identity, layout and tokens',await p.title()==='Cinema Platform' && !g.pageOverflow && !g.surfaceOverflow && !g.outside.length && !g.lenis && g.titleFont.includes('Roboto Condensed') && g.paper==='rgb(245, 241, 232)' && await p.locator('vite-error-overlay').count()===0,g)
          check(name+' five visible full titles',await p.locator('.catalogue h2').count()===5 && await p.getByRole('link',{name:normal[2].title,exact:true}).isVisible(),null)
          check(name+' no invented booking',await p.locator('.catalogue a[href^="/booking/"]').count()===0 && await p.getByRole('link',{name:/Знайти сеанси: Новий сезон/}).count()===0,null)
          if(mode==='reduce')await capture(name)
        }
        await p.getByRole('button',{name:'Сеанси',exact:true}).click();await p.locator('.catalogue-session').first().waitFor();await p.waitForTimeout(220)
        const g=await geometry()
        check('schedule-'+mode+'-'+width+' correct available sessions and geometry',await p.locator('.catalogue-session').count()===3&&!g.pageOverflow&&!g.surfaceOverflow&&!g.outside.length,g)
        if(mode==='reduce')await capture('after-schedule-'+width)
      }
    }
    check('catalogue made no aggregation requests',!requests.some(u=>u.startsWith('/api/halls')||u.startsWith('/api/sessions?')),[...requests])
    await p.emulateMedia({reducedMotion:'reduce'})
    for(const width of [1440,768,390,320]){
      await p.setViewportSize({width,height:1000});await p.goto(baseUrl+'/sessions?view=index',{waitUntil:'networkidle'});await ready()
      await p.evaluate(()=>document.documentElement.style.fontSize='200%')
      for(const view of ['Індекс','Постери']){
        await p.getByRole('button',{name:view,exact:true}).click();await p.getByRole('list',{name:view==='Індекс'?'Індекс фільмів':'Фільми у постерах',exact:true}).waitFor();const g=await geometry()
        check('200% text '+view+' '+width+' catalogue stays inside its surface',!g.surfaceOverflow&&!g.outside.length,g)
      }
      await p.getByRole('button',{name:'Сеанси',exact:true}).click();await p.locator('.catalogue-session').first().waitFor()
      const g=await geometry();check('200% text schedule '+width+' stays inside surface',!g.surfaceOverflow&&!g.outside.length,g)
      if(width===320) await capture('text-200-schedule-320')
    }
    await p.setViewportSize({width:390,height:844});await p.goto(baseUrl+'/sessions',{waitUntil:'networkidle'});await ready()
    const index=p.getByRole('button',{name:'Індекс',exact:true})
    await index.focus();await p.keyboard.press('Tab');await p.keyboard.press('Shift+Tab')
    check('keyboard view focus visible',await index.evaluate(e=>e.matches(':focus-visible')&&getComputedStyle(e).outlineWidth==='2px'),null)
    await index.press('Enter');check('keyboard index switch updates URL',new URL(p.url()).searchParams.get('view')==='index',p.url())
    await p.getByRole('button',{name:'Скоро',exact:true}).click();await p.waitForFunction(()=>document.querySelectorAll('.catalogue h2').length===1);check('coming-soon category',await p.locator('.catalogue h2').count()===1&&await p.getByRole('link',{name:'Новий сезон',exact:true}).isVisible(),null)
    await p.goBack();await p.waitForFunction(()=>document.querySelectorAll('.catalogue h2').length===5);check('history restores category',await p.locator('.catalogue h2').count()===5,null)
    await p.getByRole('link',{name:'Знайти сеанси: Дюна: Частина друга',exact:true}).click();await p.locator('.catalogue-session').first().waitFor()
    check('film links directly to filtered daily schedule',new URL(p.url()).searchParams.get('movie')==='film'&&await p.locator('.catalogue-session').count()===2,null)
    const booking=p.locator('.catalogue-session').first()
    check('booking link uses existing movie route',await booking.getAttribute('href')==='/booking/film',null)
    await p.getByRole('button',{name:'Показати всі фільми',exact:true}).click();await p.waitForFunction(()=>document.querySelectorAll('.catalogue-session').length===3);check('clear selected movie restores three screenings',await p.locator('.catalogue-session').count()===3,null)
    await p.getByLabel('Інша дата',{exact:true}).fill('2026-10-29');await p.getByText('На цю дату немає доступних сеансів',{exact:true}).waitFor();await capture('empty-schedule-390')
    await p.getByRole('button',{name:'До фільмів',exact:true}).click();await p.waitForFunction(()=>document.querySelectorAll('.catalogue h2').length===5);check('empty schedule returns to complete loaded catalogue',await p.locator('.catalogue h2').count()===5,null)
    await p.getByRole('link',{name:base.title,exact:true}).click();await p.waitForURL('**/movies/film');await p.getByRole('heading',{name:base.title,level:1,exact:true}).waitFor();check('catalogue to movie details',await p.locator('h1').textContent()===base.title,p.url())
    await p.goto(baseUrl+'/');await p.locator('h1').waitFor();await p.getByRole('link',{name:'Сеанси',exact:true}).first().isVisible().catch(()=>false)
    // Existing schedule-labelled links open daily mode directly.
    check('Home retains sessions links',await p.locator('a[href="/sessions?mode=schedule"]').count()>0,null)
    await p.locator('main a[href="/sessions?mode=schedule"]').first().click();await p.locator('.catalogue h1').waitFor();check('Home full schedule link opens schedule directly',await p.locator('h1').textContent()==='Сеанси'&&new URL(p.url()).searchParams.get('mode')==='schedule',null)
    scenario='one'
    await p.goto(baseUrl+'/sessions',{waitUntil:'networkidle'});await ready();check('one sparse active film remains visible without sessions',await p.locator('.catalogue h2').count()===1&&await p.getByText('Постер ще готується',{exact:true}).isVisible(),null)
    await capture('one-film-gallery-390');await p.getByRole('button',{name:'Індекс',exact:true}).click();await capture('one-film-index-390')
    check('runtime and console health',errors.length===0,errors)
    check('no API mutations',mutations.length===0,mutations)
    return {results,errors,requests,mutations}
  } finally { await c.close() }
}
