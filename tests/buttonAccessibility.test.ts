import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Button from '@/shared/ui/Button'

describe('shared Button accessibility markup', () => {
  it('defaults to a non-submitting native button', () => {
    const markup = renderToStaticMarkup(createElement(Button, null, 'Далі'))
    assert.ok(markup.includes('type="button"'))
    assert.ok(!markup.includes('disabled'))
    assert.ok(!markup.includes('aria-busy'))
  })

  it('keeps the action name while loading and prevents repeat activation', () => {
    const markup = renderToStaticMarkup(
      createElement(Button, { isLoading: true, disabled: false }, 'Зберегти'),
    )
    assert.ok(markup.includes('disabled=""'))
    assert.ok(markup.includes('aria-busy="true"'))
    assert.ok(markup.includes('aria-hidden="true"'))
    assert.ok(markup.includes('Зберегти'))
  })

  it('preserves submit, form, dialog focus, and native accessibility props', () => {
    const markup = renderToStaticMarkup(
      createElement(Button, {
        type: 'submit',
        form: 'movie-form',
        name: 'action',
        value: 'save',
        disabled: true,
        'aria-label': 'Зберегти фільм',
        'aria-describedby': 'save-hint',
        'aria-busy': false,
        ...{ 'data-modal-initial-focus': true },
      }),
    )
    for (const attribute of [
      'type="submit"',
      'form="movie-form"',
      'name="action"',
      'value="save"',
      'disabled=""',
      'aria-label="Зберегти фільм"',
      'aria-describedby="save-hint"',
      'aria-busy="false"',
      'data-modal-initial-focus="true"',
    ])
      assert.ok(markup.includes(attribute), attribute)
  })
})
