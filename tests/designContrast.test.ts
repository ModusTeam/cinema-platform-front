import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(
  new URL('../src/app/styles/index.css', import.meta.url),
  'utf8',
)
const tokens = new Map(
  [...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(match => [
    match[1],
    match[2].trim(),
  ]),
)
const color = (name: string): string => {
  const value = tokens.get(name)
  assert.ok(value, `Missing token ${name}`)
  return value.startsWith('var(') ? color(value.slice(4, -1)) : value
}
const luminance = (hex: string) => {
  const channels = hex.match(/[a-f\d]{2}/gi)?.map(channel => {
    const value = Number.parseInt(channel, 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  assert.ok(channels && channels.length === 3)
  const [red, green, blue] = channels
  return red * 0.2126 + green * 0.7152 + blue * 0.0722
}
const contrast = (first: string, second: string) => {
  const values = [luminance(color(first)), luminance(color(second))]
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05)
}

describe('design foundation contrast', () => {
  for (const variant of ['primary', 'secondary', 'destructive', 'success']) {
    for (const state of ['', '-hover', '-active']) {
      it(`${variant}${state} supports normal-sized action text`, () => {
        const ratio = contrast(
          '--text-on-action',
          `--action-${variant}${state}`,
        )
        assert.ok(ratio >= 4.5, `Measured ${ratio.toFixed(2)}:1`)
      })
    }
  }
  for (const surface of ['--bg-main', '--bg-card', '--surface-elevated']) {
    it(`keeps field boundaries and focus visible against ${surface}`, () => {
      for (const indicator of ['--border-field', '--focus-ring']) {
        assert.ok(contrast(indicator, surface) >= 3)
      }
    })
  }
  it('keeps selected text readable on its tinted surface', () => {
    assert.ok(contrast('--text-main', '--selection-bg') >= 4.5)
  })
})
