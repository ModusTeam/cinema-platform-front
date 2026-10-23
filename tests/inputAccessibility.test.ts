import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Input from '@/shared/ui/Input'

describe('shared Input accessibility markup', () => {
  it('associates generated unique IDs with labels', () => {
    const markup = renderToStaticMarkup(
      createElement(
        'form',
        null,
        createElement(Input, { label: 'Email', name: 'email' }),
        createElement(Input, { label: 'Password', name: 'password' }),
      ),
    )
    const ids = [...markup.matchAll(/<input[^>]* id="([^"]+)"/g)].map(
      match => match[1],
    )
    assert.equal(ids.length, 2)
    assert.notEqual(ids[0], ids[1])
    for (const id of ids) assert.ok(markup.includes(`for="${id}"`))
  })

  it('preserves caller IDs, descriptions, and native uncontrolled props', () => {
    const markup = renderToStaticMarkup(
      createElement(Input, {
        id: 'email',
        label: 'Email',
        error: 'Enter an email',
        'aria-describedby': 'email-hint external-help',
        name: 'email',
        type: 'email',
        defaultValue: 'visitor@example.com',
        required: true,
      }),
    )
    assert.ok(markup.includes('for="email"'))
    assert.ok(markup.includes('id="email"'))
    assert.ok(markup.includes('aria-invalid="true"'))
    assert.ok(
      markup.includes(
        'aria-describedby="email-hint external-help email-error"',
      ),
    )
    assert.ok(markup.includes('id="email-error" role="alert"'))
    assert.ok(markup.includes('name="email"'))
    assert.ok(markup.includes('type="email"'))
    assert.ok(markup.includes('value="visitor@example.com"'))
    assert.ok(markup.includes('required=""'))
  })

  it('retains external validity and descriptions when there is no local error', () => {
    const markup = renderToStaticMarkup(
      createElement(Input, {
        label: 'Email',
        'aria-describedby': 'hint',
        'aria-invalid': 'grammar',
      }),
    )
    assert.ok(markup.includes('aria-describedby="hint"'))
    assert.ok(markup.includes('aria-invalid="grammar"'))
    assert.ok(!markup.includes('role="alert"'))
    assert.ok(!markup.includes('-error'))
  })
})
