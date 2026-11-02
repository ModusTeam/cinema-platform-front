import { describe, it } from 'bun:test'
import assert from 'node:assert/strict'
import { InfiniteQueryObserver, QueryClient } from '@tanstack/react-query'
import {
  getHistoryTransactions,
  loyaltyHistoryQueryOptions,
} from '@/features/loyalty/model/loyaltyHistoryQuery'
import type { LoyaltyTransactionHistory } from '@/features/loyalty/model/loyalty.types'

const page = (
  skip: number,
  ids: string[],
  totalCount = 5,
): LoyaltyTransactionHistory => ({
  skip,
  limit: 2,
  totalCount,
  transactions: ids.map(id => ({
    id,
    points: 10,
    type: 'EARN_TICKET',
    balanceAfter: 100,
    orderId: null,
    description: '',
    createdAt: '2026-10-20T12:00:00Z',
  })),
})

describe('loyalty history server pagination', () => {
  it('retains accumulated rows and retries the failed offset without duplicating requests or rows', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const requests: number[][] = []
    let failNext = true
    const options = loyaltyHistoryQueryOptions(
      'user-a',
      2,
      async (limit, skip) => {
        requests.push([limit, skip])
        if (skip === 2 && failNext)
          throw new Error('Synthetic pagination failure')
        if (skip === 0) return page(0, ['a', 'b'])
        // Offset pages can overlap when new entries arrive between requests.
        if (skip === 2) return page(2, ['b', 'c'])
        return page(4, ['d'])
      },
    )
    const observer = new InfiniteQueryObserver(client, options)
    const unsubscribe = observer.subscribe(() => {})
    try {
      await client.fetchInfiniteQuery(options)
      let result = await observer.fetchNextPage()
      assert.equal(result.isFetchNextPageError, true)
      assert.deepEqual(
        getHistoryTransactions(result.data?.pages ?? []).map(row => row.id),
        ['a', 'b'],
      )
      failNext = false
      result = await observer.fetchNextPage({ cancelRefetch: false })
      assert.equal(result.isError, false)
      assert.deepEqual(
        getHistoryTransactions(result.data?.pages ?? []).map(row => row.id),
        ['a', 'b', 'c'],
      )
      assert.deepEqual(result.data?.pageParams, [0, 2])
      result = await observer.fetchNextPage()
      assert.equal(result.hasNextPage, false)
      assert.deepEqual(
        getHistoryTransactions(result.data?.pages ?? []).map(row => row.id),
        ['a', 'b', 'c', 'd'],
      )
      await observer.fetchNextPage()
      assert.deepEqual(requests, [
        [2, 0],
        [2, 2],
        [2, 2],
        [2, 4],
      ])
    } finally {
      unsubscribe()
      client.clear()
    }
  })

  it('stops on an empty page even when the server total is stale', async () => {
    const client = new QueryClient()
    const options = loyaltyHistoryQueryOptions('user', 2, async () =>
      page(0, [], 20),
    )
    try {
      await client.fetchInfiniteQuery(options)
      const observer = new InfiniteQueryObserver(client, options)
      assert.equal(observer.getCurrentResult().hasNextPage, false)
    } finally {
      client.clear()
    }
  })

  it('isolates users and page sizes and never requests anonymous history', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const first = loyaltyHistoryQueryOptions('user-a', 2, async () =>
      page(0, ['private-a'], 1),
    )
    let calls = 0
    const anonymous = loyaltyHistoryQueryOptions(undefined, 2, async () => {
      calls += 1
      return page(0, [])
    })
    const second = loyaltyHistoryQueryOptions('user-b', 2, async () =>
      page(0, ['private-b'], 1),
    )
    const observer = new InfiniteQueryObserver(client, anonymous)
    const unsubscribe = observer.subscribe(() => {})
    try {
      assert.equal(calls, 0)
      await client.fetchInfiniteQuery(first)
      observer.setOptions(second)
      assert.equal(observer.getCurrentResult().data, undefined)
      await client.fetchInfiniteQuery(second)
      assert.equal(
        observer.getCurrentResult().data?.pages[0].transactions[0].id,
        'private-b',
      )
      assert.equal(
        client.getQueryData(first.queryKey)?.pages[0].transactions[0].id,
        'private-a',
      )
      assert.notDeepEqual(
        first.queryKey,
        loyaltyHistoryQueryOptions('user-a', 20, async () => page(0, []))
          .queryKey,
      )
    } finally {
      unsubscribe()
      client.clear()
    }
  })
})
