import {afterEach, describe, expect, it, vi} from 'vitest'

import {DEFAULT_MAINNET_RPC_URL, getMainnetRpcUrl} from '../rpcUtils'

describe('getMainnetRpcUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses a CORS-enabled public endpoint when VITE_RPC_URL is not configured', () => {
    vi.stubEnv('VITE_RPC_URL', '')

    expect(getMainnetRpcUrl()).toBe(DEFAULT_MAINNET_RPC_URL)
  })

  it('prefers the configured VITE_RPC_URL so a dedicated provider can be used', () => {
    vi.stubEnv('VITE_RPC_URL', 'https://example.invalid/rpc')

    expect(getMainnetRpcUrl()).toBe('https://example.invalid/rpc')
  })

  it('never falls back to an endpoint that rejects browser requests', () => {
    vi.stubEnv('VITE_RPC_URL', '')

    // viem's built-in mainnet default (eth.merkle.io) rate limits browsers and
    // omits CORS headers on its 429 responses, which broke the wallet modal.
    expect(getMainnetRpcUrl()).not.toContain('merkle.io')
  })
})
