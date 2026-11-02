// Native SVG parsing and real page/query regressions. Run with Vite on 5173
// through Playwright browser_run_code (pass contents as code), without database requests.
async function achievementReview(page) {
  const context = await page.context().browser().newContext()
  const tab = await context.newPage()
  const errors = []
  tab.on('pageerror', error => errors.push(error.message))
  try {
    await tab.route('**/*', route => {
      if (route.request().resourceType() === 'document')
        return route.fulfill({
          contentType: 'text/html',
          body: '<html><body></body></html>',
        })
      return route.continue()
    })
    await tab.goto('http://127.0.0.1:5173/__achievement_review__')
    const result = await tab.evaluate(async () => {
      const { default: refresh } = await import('/@react-refresh')
      refresh.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => type => type
      window.__vite_plugin_react_preamble_installed__ = true
      const { default: React } = await import(
        '/node_modules/.vite/deps/react.js'
      )
      const h = React.createElement
      const { default: ReactDOM } = await import(
        '/node_modules/.vite/deps/react-dom_client.js'
      )
      const { createRoot } = ReactDOM
      // Use Vite's exact optimized URLs so providers share the app's contexts.
      const source = await (
        await fetch('/src/pages/account/AchievementsPage.tsx')
      ).text()
      const imports = [...source.matchAll(/from ["']([^"']+)["']/g)].map(
        match => match[1],
      )
      const hookSource = await (
        await fetch(
          '/src/features/loyalty/achievements/model/useAchievementsTabData.ts',
        )
      ).text()
      const queryUrl = [...hookSource.matchAll(/from ["']([^"']+)["']/g)]
        .map(match => match[1])
        .find(url => url.includes('@tanstack_react-query'))
      const { QueryClient, QueryClientProvider, onlineManager } = await import(
        queryUrl
      )
      const { MemoryRouter, Routes, Route } = await import(
        imports.find(url => url.includes('react-router-dom'))
      )
      const { validateAchievementIconBody } = await import(
        '/src/features/loyalty/achievements/achievementIconValidation.ts'
      )
      const { CURATED_ACHIEVEMENT_ICONS } = await import(
        '/src/features/loyalty/achievements/achievementIcons.ts'
      )
      const { loadAchievementIcon } = await import(
        '/src/features/loyalty/achievements/achievementIconApi.ts'
      )
      const { AchievementIcon } = await import(
        '/src/features/loyalty/achievements/AchievementIcon.tsx'
      )
      const { AuthProvider } = await import(
        '/src/features/auth/model/AuthContext.tsx'
      )
      const { authService } = await import(
        '/src/features/auth/api/auth.service.ts'
      )
      const { achievementsService } = await import(
        '/src/features/loyalty/achievements/achievements.service.ts'
      )
      const { default: Collection } = await import(
        '/src/pages/account/AchievementsPage.tsx'
      )
      const { default: Details } = await import(
        '/src/pages/account/AchievementDetailsPage.tsx'
      )
      const check = (condition, message) => {
        if (!condition) throw new Error(message)
      }
      const waitFor = async condition => {
        for (let i = 0; i < 100; i++) {
          if (condition()) return
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        throw new Error(
          `Timed out waiting for rendered state: ${host.innerHTML}; ${client
            .getQueryCache()
            .getAll()
            .map(q => `${q.queryHash}: ${q.state.status} ${q.state.error}`)
            .join('; ')}`,
        )
      }
      const host = document.body.appendChild(document.createElement('div'))
      const root = createRoot(host)
      const originalFetch = window.fetch
      const originalUser = authService.getCurrentUser
      const originalLoad = achievementsService.getAchievementsTabData
      let client
      let mountId = 0
      const makeClient = () =>
        new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: Infinity } },
        })
      const render = element =>
        root.render(h(QueryClientProvider, { client }, element))
      const malicious = [
        '<script>alert(1)</script>',
        '<path d="M0 0" onload="alert(1)"/>',
        '<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">bad</div></foreignObject>',
        '<image href="https://evil.invalid/a.svg"/>',
        '<use href="javascript:alert(1)"/>',
        '<a href="data:text/html,bad"><path d="M0 0"/></a>',
        '<path d="M0 0" fill="url(https://evil.invalid/a.svg)"/>',
        '<path d="M0 0" fill="u&#114;l(#x)"/>',
        '<path d="M0 0" style="fill:url(https://evil.invalid)"/>',
        '<path xmlns:x="http://www.w3.org/1999/xlink" x:href="https://evil.invalid"/>',
        '<path xmlns="http://www.w3.org/1999/xhtml" onload="alert(1)"/>',
        '<s:path xmlns:s="http://www.w3.org/2000/svg" d="M0 0"/>',
        '<path d="M0 0"><animate attributeName="fill" values="red;url(https://evil.invalid)"/></path>',
        '<style>path{fill:url(https://evil.invalid)}</style>',
        '<?xml-stylesheet href="https://evil.invalid"?><path d="M0 0"/>',
        '<!DOCTYPE svg [<!ENTITY x SYSTEM "https://evil.invalid">]><path d="&x;"/>',
        '<path d="M0 0"/><![CDATA[<script>bad</script>]]>',
        '<path d="M0 0"',
      ]
      try {
        client = makeClient()
        for (const icon of CURATED_ACHIEVEMENT_ICONS) {
          const safe = validateAchievementIconBody(icon.data.body)
          check(
            safe.includes('<path'),
            `Rejected legitimate artwork: ${icon.id}`,
          )
        }
        const valid = CURATED_ACHIEVEMENT_ICONS[0].data.body
        window.fetch = async () =>
          new Response(
            JSON.stringify({
              width: 24,
              height: 24,
              icons: { coffee: { body: valid } },
            }),
          )
        const safe = await loadAchievementIcon(
          'withicons-retro:coffee',
          new AbortController().signal,
        )
        check(
          safe.width === 24 && safe.body.includes('fill='),
          'Remote multicolor artwork was lost',
        )
        render(h(AchievementIcon, { identifier: 'withicons-retro:coffee' }))
        await waitFor(() => host.querySelector('path[fill]'))
        check(
          new Set(
            [...host.querySelectorAll('path[fill]')].map(p =>
              p.getAttribute('fill'),
            ),
          ).size > 1,
          'Multicolor rendering lost',
        )
        for (const body of malicious) {
          window.fetch = async () =>
            new Response(
              JSON.stringify({
                icons: { coffee: { body: `<path d="M0 0"/>${body}` } },
              }),
            )
          let rejected = false
          try {
            await loadAchievementIcon(
              'withicons-retro:coffee',
              new AbortController().signal,
            )
          } catch {
            rejected = true
          }
          check(rejected, `Accepted malicious artwork: ${body}`)
        }
        root.render(null)
        await waitFor(() => !host.childNodes.length)
        client.clear()
        client = makeClient()
        render(h(AchievementIcon, { identifier: 'withicons-retro:coffee' }))
        await waitFor(
          () =>
            client.getQueryState(['achievement-icon', 'withicons-retro:coffee'])
              ?.status === 'error',
        )
        check(
          !!host.querySelector('.lucide-trophy') &&
            !host.querySelector('script, foreignObject, image'),
          'Invalid SVG did not use fallback',
        )
        window.fetch = originalFetch

        const item = {
          id: 'first',
          code: 'FIRST',
          title: 'Перше досягнення',
          description: 'Опис',
          status: 'unlocked',
          category: 'visits',
          categoryLabel: 'Візити',
          rarity: 'common',
          rarityLabel: 'Звичайне',
          strategy: 'threshold',
          strategyLabel: 'Прогрес',
          current: 1,
          target: 1,
          progressPercent: 100,
          pointsReward: 10,
          isSecret: false,
          icon: 'trophy',
          sortOrder: 1,
        }
        const data = {
          achievements: [item],
          summary: { unlocked: 1, inProgress: 0, locked: 0, total: 1 },
        }
        let user = 'user-a'
        authService.getCurrentUser = () => ({
          id: user,
          email: '',
          name: '',
          surname: '',
          role: 'user',
        })
        const mount = async (
          Component,
          id = 'first',
          search = '?category=visits&status=unlocked',
        ) => {
          root.render(null)
          await waitFor(() => !host.childNodes.length)
          const path =
            Component === Details
              ? `/profile/achievements/${id}`
              : '/profile/achievements'
          render(
            h(
              AuthProvider,
              { key: ++mountId },
              h(
                MemoryRouter,
                {
                  initialEntries: [`${path}${search}`],
                },
                h(
                  Routes,
                  null,
                  h(Route, {
                    path:
                      Component === Details
                        ? '/profile/achievements/:id'
                        : '/profile/achievements',
                    element: h(Component),
                  }),
                ),
              ),
            ),
          )
          await waitFor(() =>
            client
              .getQueryCache()
              .find({ queryKey: ['achievements-tab', user] }),
          )
        }
        for (const Component of [Collection, Details]) {
          client.clear()
          client = makeClient()
          achievementsService.getAchievementsTabData = () =>
            new Promise(() => {})
          await mount(Component)
          await waitFor(() => host.textContent.includes('Завантажуємо'))
          root.render(null)
          await waitFor(() => !host.childNodes.length)
          client.clear()
          onlineManager.setOnline(false)
          await mount(Component)
          await waitFor(() => host.textContent.includes('Немає з’єднання'))
          root.render(null)
          await waitFor(() => !host.childNodes.length)
          client.clear()
          onlineManager.setOnline(true)
          achievementsService.getAchievementsTabData = async () => {
            throw new Error('offline')
          }
          await mount(Component)
          await waitFor(() => host.textContent.includes('тимчасово недоступн'))
          onlineManager.setOnline(false)
          const initialRecovery = client.refetchQueries({
            queryKey: ['achievements-tab', user],
          })
          await waitFor(() => host.textContent.includes('Немає з’єднання'))
          achievementsService.getAchievementsTabData = async () => data
          onlineManager.setOnline(true)
          await initialRecovery
          await waitFor(() => host.textContent.includes(item.title))
          achievementsService.getAchievementsTabData = async () => {
            throw new Error('background failure')
          }
          await client.refetchQueries({ queryKey: ['achievements-tab', user] })
          await waitFor(
            () =>
              client.getQueryState(['achievements-tab', user]).status ===
              'error',
          )
          check(
            host.textContent.includes(item.title) &&
              !host.textContent.includes('тимчасово недоступн'),
            'Background failure hid cache',
          )
          onlineManager.setOnline(false)
          const recovery = client.refetchQueries({
            queryKey: ['achievements-tab', user],
          })
          await waitFor(
            () =>
              client.getQueryState(['achievements-tab', user]).fetchStatus ===
              'paused',
          )
          check(
            host.textContent.includes(item.title),
            'Paused refetch hid cache',
          )
          achievementsService.getAchievementsTabData = async () => data
          onlineManager.setOnline(true)
          await recovery
          await waitFor(
            () =>
              client.getQueryState(['achievements-tab', user]).status ===
              'success',
          )
          if (Component === Details) {
            check(
              host.querySelector(
                'a[href="/profile/achievements?category=visits&status=unlocked"]',
              ),
              'Back link lost filters',
            )
            await mount(Details, 'missing')
            await waitFor(() =>
              host.textContent.includes('Тут поки немає досягнення'),
            )
          } else {
            check(
              host.querySelector('[aria-pressed="true"]'),
              'Filter selection lost',
            )
          }
          client.setQueryData(['achievements-tab', user], {
            ...data,
            achievements: [
              {
                ...item,
                isSecret: true,
                status: 'locked',
                title: 'CONCEALED',
                description: 'CONCEALED',
                code: 'CONCEALED',
                icon: 'withicons-retro:coffee',
                secretHint: 'Підказка',
              },
            ],
          })
          await mount(Component, 'first', '?status=all')
          await waitFor(() => host.textContent.includes('Секретне досягнення'))
          check(
            !host.innerHTML.includes('CONCEALED') &&
              !host.innerHTML.includes('coffee'),
            'Secret leaked',
          )
          achievementsService.getAchievementsTabData = () =>
            new Promise(() => {})
          user = 'user-b'
          await mount(Component)
          await waitFor(() => host.textContent.includes('Завантажуємо'))
          check(
            !host.textContent.includes('Підказка'),
            'User switch exposed previous cache',
          )
          user = 'user-a'
        }
        return {
          svg: '30 bundled icons, remote multicolor, 18 attack cases and Trophy fallback passed',
          pages:
            'collection/details loading, failure, offline, cached refetch, recovery, filters/back, missing ID, secret masking and user isolation passed',
        }
      } finally {
        root.unmount()
        client?.clear()
        onlineManager.setOnline(true)
        window.fetch = originalFetch
        authService.getCurrentUser = originalUser
        achievementsService.getAchievementsTabData = originalLoad
      }
    })
    if (errors.length) throw new Error(errors.join('; '))
    return result
  } catch (error) {
    throw new Error(`${error.message}; browser errors: ${errors.join('; ')}`)
  } finally {
    await context.close()
  }
}
