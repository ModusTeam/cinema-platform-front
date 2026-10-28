import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FAQ_ITEMS } from '@/pages/public/data/faq'
import FAQPage from '@/pages/public/FAQPage'

const getAttribute = (markup: string, name: string) =>
  markup.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]

describe('FAQ accessibility markup', () => {
  it('connects every question to its answer and hides closed answers', () => {
    const markup = renderToStaticMarkup(createElement(FAQPage))
    const buttons = [...markup.matchAll(/<button\b([^>]*)>/g)]
    const panels = [...markup.matchAll(/<section\b([^>]*)>/g)]
    assert.equal(buttons.length, FAQ_ITEMS.length)

    buttons.forEach((button, index) => {
      const panelId = getAttribute(button[1], 'aria-controls')
      assert.ok(panelId)
      const panel = panels.find(item => getAttribute(item[1], 'id') === panelId)
      assert.ok(panel, 'the controlled answer must exist')
      assert.equal(
        getAttribute(panel[1], 'aria-labelledby'),
        getAttribute(button[1], 'id'),
      )
      assert.equal(
        getAttribute(button[1], 'aria-expanded'),
        String(index === 0),
      )
      assert.equal(/\bhidden(?:=|\s|$)/.test(panel[1]), index !== 0)
      for (const text of [FAQ_ITEMS[index].question, FAQ_ITEMS[index].answer]) {
        const escaped = renderToStaticMarkup(
          createElement('span', null, text),
        ).replace(/^<span>|<\/span>$/g, '')
        assert.ok(
          markup.includes(escaped),
          'existing FAQ content must be retained',
        )
      }
    })
  })

  it('keeps disclosure identifiers unique when multiple instances render', () => {
    const markup = renderToStaticMarkup(
      createElement(
        'div',
        null,
        createElement(FAQPage),
        createElement(FAQPage),
      ),
    )
    const ids = [...markup.matchAll(/\bid="([^"]*)"/g)].map(match => match[1])
    assert.equal(new Set(ids).size, ids.length)
  })
})
