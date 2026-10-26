// Pass this function to Playwright browser_run_code with an absolute outputDir.
// No additional browser dependency is installed in the application.
async (page, { outputDir, baseUrl = 'http://127.0.0.1:5174' } = {}) => {
  if (!outputDir) throw new Error('Provide an existing absolute outputDir')
  const context = await page.context().browser().newContext({
    locale: 'uk-UA',
    timezoneId: 'Europe/Kyiv',
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  const specimen = await context.newPage()
  const errors = []
  const unexpectedRequests = []
  specimen.on('pageerror', e => errors.push(e.message))
  specimen.on('console', m => {
    if (m.type() === 'error') errors.push(m.text())
  })
  await specimen.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin === baseUrl) return route.continue()
    unexpectedRequests.push(url.origin + url.pathname)
    return route.abort()
  })
  await specimen.clock.setFixedTime(new Date('2026-10-26T09:00:00Z'))
  const entry = `${baseUrl}/docs/design/ui-experience-polish/lab/index.html`
  const measurements = []
  const assert = (condition, message) => {
    if (!condition) throw new Error(message)
  }
  const open = async query => {
    await specimen.goto(`${entry}?${query}`, { waitUntil: 'networkidle' })
    await specimen.locator('h1').waitFor()
    await specimen.evaluate(() => document.fonts.ready)
    assert(await specimen.title() === 'Cinema | UI design lab (fixtures)', 'Wrong page')
    assert(await specimen.locator('.design-lab').count() === 1, 'Blank lab')
    assert(await specimen.locator('vite-error-overlay').count() === 0, 'Vite overlay')
  }
  const capture = async name => {
    await specimen.screenshot({ path: `${outputDir}/${name}.png`, fullPage: true })
  }
  const cdp = await context.newCDPSession(specimen)
  await cdp.send('DOM.enable')
  await cdp.send('CSS.enable')
  try {
    for (const width of [1440, 768, 390, 320]) {
      await specimen.setViewportSize({ width, height: width >= 768 ? 1000 : 844 })
      for (const variant of ['a', 'b', 'c']) {
        for (const title of ['normal', 'long']) {
          await open(`variant=${variant}&title=${title}&treatment=proposed`)
          const stats = await specimen.evaluate(() => {
            const heading = document.querySelector('h1')
            const cardTitle = document.querySelector('.lab-movie-card h3')
            const style = getComputedStyle(heading)
            return {
              overflow: document.documentElement.scrollWidth > innerWidth,
              headingHeight: heading.getBoundingClientRect().height,
              headingSize: style.fontSize,
              headingFamily: style.fontFamily,
              headingLineHeight: style.lineHeight,
              cardTitleHeight: cardTitle.getBoundingClientRect().height,
              cardTitleClamped: cardTitle.scrollHeight > cardTitle.clientHeight,
              inputSize: getComputedStyle(document.querySelector('.field')).fontSize,
              tableNumerals: getComputedStyle(document.querySelector('.lab-table')).fontVariantNumeric,
            }
          })
          assert(!stats.overflow, `Horizontal page overflow: ${variant}/${width}/${title}`)
          const { root } = await cdp.send('DOM.getDocument')
          const renderedFonts = []
          for (const selector of ['[data-glyphs="display"]', '[data-glyphs="body"]']) {
            const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector })
            const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId })
            assert(fonts.length > 0 && fonts.every(f => f.isCustomFont), `Fallback glyphs: ${variant}`)
            renderedFonts.push({ selector, fonts })
          }
          measurements.push({ width, variant, title, ...stats, renderedFonts })
          await capture(`fixture-${variant}-${width}-${title}`)
        }
      }
    }

    // Same layout and font A, isolating the surface treatment from typography.
    for (const width of [1440, 390]) {
      await specimen.setViewportSize({ width, height: width === 1440 ? 1000 : 844 })
      await open('variant=a&treatment=current')
      await capture(`fixture-a-${width}-current-surfaces`)
    }

    await specimen.setViewportSize({ width: 390, height: 844 })
    await open('variant=c')
    await specimen.getByRole('button', { name: 'Купити квиток', exact: true }).click()
    assert(await specimen.locator('#session-heading').evaluate(e => e === document.activeElement), 'CTA must move focus to sessions')
    await specimen.locator('.lab-sessions button').first().click()
    assert(await specimen.locator('.lab-sessions button').first().getAttribute('aria-pressed') === 'true', 'Session must select')
    assert((await specimen.locator('.lab-selection-status').innerText()).includes('16:30'), 'Session status must update')
    await specimen.getByLabel('Ім’я', { exact: true }).fill('Ївга')
    await specimen.getByRole('button', { name: 'Зберегти зміни', exact: true }).click()
    assert(await specimen.getByText('Зміни показано лише в макеті.').isVisible(), 'Form acknowledgement missing')
    await capture('fixture-c-390-form-saved')
    await specimen.getByLabel('Стан афіші').selectOption('empty')
    assert(await specimen.getByText('Немає сеансів на цю дату', { exact: true }).isVisible(), 'Missing empty state')
    await capture('fixture-c-390-empty')
    await specimen.getByRole('button', { name: 'Повернути сеанси' }).click()
    assert(await specimen.locator('.lab-movie-card').isVisible(), 'Empty-state recovery failed')
    await specimen.getByLabel('Стан афіші').selectOption('loading')
    assert(await specimen.getByText('Завантажуємо афішу…').isVisible(), 'Missing loading state')
    await capture('fixture-c-390-loading')

    // Actual keyboard focus on the CTA. The fill mask must not clip its outline.
    await specimen.setViewportSize({ width: 1440, height: 1000 })
    await open('variant=c')
    const cta = specimen.getByRole('button', { name: 'Купити квиток', exact: true })
    await cta.focus()
    await specimen.keyboard.press('Tab')
    await specimen.keyboard.press('Shift+Tab')
    const focus = await cta.evaluate(e => ({
      visible: e.matches(':focus-visible'),
      outline: getComputedStyle(e).outlineWidth,
      mask: getComputedStyle(e).maskImage,
    }))
    assert(focus.visible && focus.outline === '2px' && focus.mask === 'none', 'Missing/unmasked keyboard focus')
    await capture('fixture-c-1440-keyboard-focus')
    await cta.press('Enter')
    assert(await specimen.locator('#session-heading').evaluate(e => e === document.activeElement), 'Keyboard CTA failed')
    await specimen.getByRole('combobox', { name: /^Типографіка/ }).selectOption('b')
    assert(await specimen.locator('.design-lab').getAttribute('data-variant') === 'b', 'Font selector failed')
    await specimen.getByLabel('Поверхні').selectOption('current')
    assert(await specimen.locator('.design-lab').getAttribute('data-treatment') === 'current', 'Treatment selector failed')
    await specimen.getByLabel('Довга назва (стрес-тест)').check()
    assert((await specimen.locator('h1').innerText()).includes('режисерської'), 'Long title control failed')

    // Motion enabled for the final interaction specimen only.
    await specimen.emulateMedia({ reducedMotion: 'no-preference' })
    await open('variant=c')
    await cta.hover()
    await specimen.waitForTimeout(250)
    const hoverTransform = await cta.evaluate(e => getComputedStyle(e).transform)
    assert(hoverTransform !== 'none', 'Missing CTA hover feedback')
    await capture('fixture-c-1440-ticket-hover')
    await specimen.emulateMedia({ reducedMotion: 'reduce' })
    await open('variant=c')
    await cta.hover()
    await specimen.waitForTimeout(250)
    const reducedTransform = await cta.evaluate(e => getComputedStyle(e).transform)
    assert(reducedTransform === 'none', 'Reduced motion must disable CTA movement')
    assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`)
    assert(unexpectedRequests.length === 0, 'Lab must not request remote resources or APIs')
    return { browser: await context.browser().version(), fixedTime: '2026-10-26T09:00:00Z', locale: 'uk-UA', timezone: 'Europe/Kyiv', measurements, focus, hoverTransform, reducedTransform, errors, unexpectedRequests, interactions: 'CTA click and Enter, session selection, profile edit/submit, empty/recovery/loading, typography/surface/long-title selectors, keyboard focus, hover and reduced motion' }
  } finally {
    await context.close()
  }
}
