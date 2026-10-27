// Supplemental isolated catalogue pagination, failures, motion and UTC-day boundary checks.
async (page) => {
  const output='D:/PROGRAMMINGPROJECTS/cinema-platform-front/docs/design/ui-experience-polish'
  const c=await page.context().browser().newContext({locale:'uk-UA',timezoneId:'Europe/Kyiv',reducedMotion:'reduce'})
  const p=await c.newPage(),results=[],errors=[],mutations=[],requests=[]
  const check=(name,passed,details=null)=>{results.push({name,passed,details});if(!passed)throw new Error(name+': '+JSON.stringify(details))}
  const movie={id:'film',title:'Дюна: Частина друга',description:'Фільм.',durationMinutes:166,releaseYear:2024,rating:8.5,status:2,genres:['Фантастика'],posterUrl:'/docs/design/ui-experience-polish/fixtures/phase-5/dune-poster.jpg'}
  const large=Array.from({length:125},(_,i)=>({...movie,id:'film-'+i,title:'Історія '+String(i+1).padStart(3,'0'),status:i===124?1:2}))
  let scenario='large',nextFailure=false,hold=false,release,gate=Promise.resolve()
  const beginHold=()=>{hold=true;gate=new Promise(resolve=>{release=resolve})}
  const finishHold=()=>{hold=false;release?.()}
  p.on('pageerror',e=>errors.push({kind:'runtime',message:e.message}))
  p.on('console',m=>{if(m.type()==='error')errors.push({kind:'console',message:m.text()})})
  await p.clock.setFixedTime(new Date('2026-10-28T09:00:00Z'))
  await c.route('**/*',async route=>{
    const r=route.request(),u=new URL(r.url())
    if(!u.pathname.startsWith('/api/'))return route.continue()
    if(r.method()!=='GET'){mutations.push(u.pathname);return route.abort()}
    requests.push(u.pathname+u.search)
    if(hold)await gate
    const headers={'Access-Control-Allow-Origin':'*'}
    if(u.pathname==='/api/movies'){
      const pageNumber=Number(u.searchParams.get('pageNumber')??1),pageSize=Number(u.searchParams.get('pageSize')??12)
      if(scenario==='catalogue-error'||(nextFailure&&pageNumber===2))return route.fulfill({status:503,json:{title:'Fixture unavailable'},headers})
      const records=scenario==='empty'?[]:scenario==='large'?large:[movie]
      return route.fulfill({json:{items:records.slice((pageNumber-1)*pageSize,pageNumber*pageSize),pageNumber,totalPages:Math.ceil(records.length/pageSize),totalCount:records.length,hasNextPage:pageNumber*pageSize<records.length},headers})
    }
    if(u.pathname==='/api/sessions/by-date'){
      if(scenario==='schedule-error')return route.fulfill({status:503,json:{title:'Fixture unavailable'},headers})
      const sessions=[
        {id:'early',movieId:'film',movieTitle:movie.title,hallId:'h',hallName:'Зал',status:'Scheduled',startTime:'2026-10-28T22:15:00Z'},
        {id:'late',movieId:'film',movieTitle:movie.title,hallId:'h',hallName:'Зал',status:'Scheduled',startTime:'2026-10-29T21:45:00Z'},
        {id:'next-day',movieId:'film',movieTitle:movie.title,hallId:'h',hallName:'Зал',status:'Scheduled',startTime:'2026-10-29T22:00:00Z'},
      ]
      return route.fulfill({json:sessions.filter(s=>s.startTime.startsWith(u.searchParams.get('date'))),headers})
    }
    if(u.pathname.startsWith('/api/movies/'))return route.fulfill({json:movie,headers})
    return route.fulfill({json:[],headers})
  })
  const open=async search=>{await p.goto('http://127.0.0.1:5176/sessions'+(search??''),{waitUntil:'domcontentloaded'});await p.locator('.catalogue h1').waitFor()}
  const count=n=>p.waitForFunction(n=>document.querySelectorAll('.catalogue h2').length===n,n)
  const capture=name=>p.screenshot({path:output+'/screenshots/phase-6/'+name+'.png',fullPage:true})
  try{
    await p.setViewportSize({width:1440,height:1000});await open();await count(12)
    check('first catalogue request is bounded to twelve films',requests[0].includes('pageSize=12')&&await p.getByRole('button',{name:'Показати ще',exact:true}).isVisible(),[...requests])
    nextFailure=true
    await p.getByRole('button',{name:'Показати ще',exact:true}).click();await p.getByText('Не вдалося завантажити наступну сторінку.',{exact:false}).waitFor()
    check('next-page failure retains the first page and exposes retry',await p.locator('.catalogue h2').count()===12&&await p.getByRole('button',{name:'Спробувати ще раз',exact:true}).isVisible(),null)
    await capture('pagination-error-1440')
    nextFailure=false;beginHold()
    await p.getByRole('button',{name:'Спробувати ще раз',exact:true}).click();await p.getByRole('button',{name:'Завантажуємо…',exact:true}).waitFor()
    check('load-more pending control prevents duplicate requests',await p.getByRole('button',{name:'Завантажуємо…',exact:true}).isDisabled(),null)
    finishHold();await count(24)
    await p.getByRole('button',{name:'Індекс',exact:true}).click();await p.getByRole('list',{name:'Індекс фільмів',exact:true}).waitFor()
    await p.getByRole('button',{name:'Скоро',exact:true}).click();await p.getByText('Серед завантажених записів немає таких фільмів',{exact:true}).waitFor()
    check('partial category does not pretend later pages are empty',await p.getByRole('button',{name:'Показати ще',exact:true}).isVisible(),null)
    for(let i=0;i<9;i++){
      const expected=Math.min(125,36+i*12)
      await p.getByRole('button',{name:'Показати ще',exact:true}).click()
      await p.waitForFunction(n=>[...document.querySelectorAll('output')].some(e=>e.textContent.includes('Завантажено '+n+' із 125')),expected)
    }
    await count(1)
    check('coming-soon film beyond first hundred can be discovered',await p.getByRole('link',{name:'Історія 125',exact:true}).isVisible()&&await p.getByRole('button',{name:'Показати ще',exact:true}).count()===0,null)
    await p.getByRole('button',{name:'Усі фільми',exact:true}).click();await count(125)
    await capture('large-catalogue-index-1440')
    check('all eleven API pages were loaded on explicit request',new Set(requests.filter(u=>u.startsWith('/api/movies?')).map(u=>new URL(u,'http://fixture').searchParams.get('pageNumber'))).size===11,[...requests])
    scenario='empty';await open('?view=index');await p.getByText('У цій категорії поки немає фільмів',{exact:true}).waitFor();await capture('empty-catalogue-1440')
    scenario='one';beginHold();await open();await p.getByText('Завантажуємо фільми',{exact:true}).waitFor();await capture('loading-catalogue-1440')
    check('catalogue loader is distinct from empty state',await p.getByText('У цій категорії поки немає фільмів',{exact:true}).count()===0,null)
    finishHold();await count(1)
    scenario='catalogue-error';await open();await p.getByText('Не вдалося завантажити фільми',{exact:true}).waitFor();await capture('error-catalogue-1440')
    check('catalogue failure does not use empty copy',await p.getByText('У цій категорії поки немає фільмів',{exact:true}).count()===0,null)
    scenario='one';await p.getByRole('button',{name:'Спробувати ще раз',exact:true}).click();await count(1)
    check('catalogue retry recovers without navigation',await p.getByRole('link',{name:movie.title,exact:true}).isVisible(),null)
    const poster=p.locator('.catalogue-poster')
    await p.emulateMedia({reducedMotion:'no-preference'});await poster.hover();await p.waitForTimeout(400)
    check('poster hover has restrained motion',await poster.evaluate(e=>getComputedStyle(e).transform!=='none'),null)
    await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>getComputedStyle(document.querySelector('.catalogue-poster')).transform==='none')
    check('dynamic reduced motion removes hover movement',await poster.evaluate(e=>getComputedStyle(e).transform==='none'),null)
    scenario='schedule-error';await open('?mode=schedule&date=2026-10-29');await p.getByText('Не вдалося завантажити сеанси',{exact:true}).waitFor();await capture('error-schedule-1440')
    check('schedule failure has no empty-data message or booking links',await p.getByText('На цю дату немає доступних сеансів',{exact:true}).count()===0&&await p.locator('.catalogue-session').count()===0,null)
    scenario='one';beginHold();await p.getByRole('button',{name:'Спробувати ще раз',exact:true}).click();await p.getByText('Завантажуємо сеанси',{exact:true}).waitFor();finishHold();await p.waitForFunction(()=>document.querySelectorAll('.catalogue-session').length===2)
    check('UTC requests preserve early and late local screenings without next-day leakage',(await p.locator('.catalogue-session time').allTextContents()).join(',')==='00:15,23:45',await p.locator('.catalogue-session time').allTextContents())
    await capture('utc-boundary-schedule-1440')
    beginHold();await p.getByLabel('Інша дата',{exact:true}).fill('2026-10-31');await p.getByText('Завантажуємо сеанси',{exact:true}).waitFor();await capture('loading-schedule-1440');finishHold();await p.getByText('На цю дату немає доступних сеансів',{exact:true}).waitFor()
    const boundary=await p.evaluate(async()=>{
      const {utcDaysForLocalDate}=await import('/src/entities/session/lib/sessionDates.ts')
      return ['2026-03-29','2026-10-25','2026-12-31'].map(key=>{const [y,m,d]=key.split('-').map(Number);return {key,days:utcDaysForLocalDate(new Date(y,m-1,d))}})
    })
    check('Kyiv DST and year-end UTC coverage',boundary.every(b=>b.days.length===2)&&boundary[0].days.join(',')==='2026-03-28,2026-03-29'&&boundary[1].days.join(',')==='2026-10-24,2026-10-25'&&boundary[2].days.join(',')==='2026-12-30,2026-12-31',boundary)
    await open('?mode=schedule&date=invalid');await p.getByLabel('Інша дата',{exact:true}).waitFor()
    check('invalid date URL falls back to a real local day',await p.getByLabel('Інша дата',{exact:true}).inputValue()==='2026-10-28',null)
    check('no runtime errors and no mutations',!errors.some(e=>e.kind==='runtime')&&mutations.length===0,{errors,mutations})
    return {results,errors,requests,mutations}
  }finally{finishHold();await c.close()}
}
