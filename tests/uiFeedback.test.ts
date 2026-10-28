import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ToastContainer from '@/shared/ui/toast/ToastContainer'
import type { Toast } from '@/shared/ui/toast/toast.types'
import {
  enqueueToast,
  MAX_TOASTS,
  TOAST_DURATION,
} from '@/shared/ui/toast/toastQueue'

const notification = (id: string, type: Toast['type'] = 'info'): Toast => ({
  id,
  type,
  message: `Повідомлення ${id}`,
})

describe('notification queue and announcements', () => {
  it('deduplicates identical messages without conflating severity', () => {
    const original = [notification('first')]
    assert.equal(
      enqueueToast(original, { ...original[0], id: 'duplicate' }),
      original,
    )
    const urgent = enqueueToast(original, {
      ...original[0],
      id: 'error',
      type: 'error',
    })
    assert.equal(urgent.length, 2)
    assert.equal(original.length, 1)
  })

  it('bounds stacking and retains errors when routine messages arrive', () => {
    const original = [
      notification('important', 'error'),
      notification('a'),
      notification('b'),
      notification('c'),
    ]
    const next = enqueueToast(original, notification('d', 'success'))
    assert.equal(next.length, MAX_TOASTS)
    assert.ok(next.some(item => item.id === 'important'))
    assert.ok(next.some(item => item.id === 'd'))
    assert.equal(original.length, 4)
    const errors = Array.from({ length: MAX_TOASTS }, (_, index) =>
      notification(String(index), 'error'),
    )
    assert.deepEqual(enqueueToast(errors, notification('routine')), errors)
    assert.equal(
      enqueueToast(errors, notification('new-error', 'error')).at(-1)?.id,
      'new-error',
    )
  })

  it('keeps errors persistent and gives warnings longer than routine feedback', () => {
    assert.equal(TOAST_DURATION.error, 0)
    assert.ok(TOAST_DURATION.warning > TOAST_DURATION.info)
    assert.ok(TOAST_DURATION.info >= TOAST_DURATION.success)
  })

  it('announces each message separately with its appropriate urgency', () => {
    const markup = renderToStaticMarkup(
      createElement(ToastContainer, {
        toasts: [notification('info'), notification('error', 'error')],
        removeToast: () => {},
      }),
    )
    assert.equal((markup.match(/role="alert"/g) ?? []).length, 1)
    assert.equal((markup.match(/role="status"/g) ?? []).length, 1)
    assert.equal(
      (markup.match(/aria-label="Закрити сповіщення"/g) ?? []).length,
      2,
    )
    assert.equal((markup.match(/aria-atomic="true"/g) ?? []).length, 2)
  })
})
