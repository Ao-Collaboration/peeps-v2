import {mainnet} from 'viem/chains'
import {afterEach, describe, expect, it, vi} from 'vitest'

import {fetchUserNFTs} from '../nftUtils'
import {DEFAULT_MAINNET_RPC_URL} from '../rpcUtils'

const OWNER = '0x455fef5aeCACcd3a43A4BCe2c303392E10f22C63'

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

/** viem normalises transport URLs with a trailing slash. */
function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

async function recordRequestUrls(): Promise<string[]> {
  const requestedUrls: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      requestedUrls.push(requestUrl(input))
      return new Response(JSON.stringify({jsonrpc: '2.0', id: 1, result: `0x${'0'.repeat(64)}`}), {
        status: 200,
        headers: {'content-type': 'application/json'},
      })
    }),
  )

  await fetchUserNFTs(OWNER)

  return requestedUrls
}

describe('fetchUserNFTs RPC transport', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('sends contract reads to the configured CORS-enabled endpoint', async () => {
    const requestedUrls = await recordRequestUrls()

    expect(requestedUrls).toHaveLength(1)
    expect(withoutTrailingSlash(requestedUrls[0])).toBe(
      withoutTrailingSlash(DEFAULT_MAINNET_RPC_URL),
    )
  })

  it('never relies on viem’s implicit mainnet default (no CORS-guaranteed failure path)', async () => {
    const requestedUrls = await recordRequestUrls()
    const viemDefault = mainnet.rpcUrls.default.http[0]

    expect(requestedUrls).not.toContain(viemDefault)
    expect(requestedUrls.every(url => !url.includes('merkle.io'))).toBe(true)
  })
})
