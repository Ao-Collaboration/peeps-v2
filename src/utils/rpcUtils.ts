/**
 * Ethereum Mainnet JSON-RPC endpoint used for read-only contract calls.
 *
 * This must be an endpoint that is reachable from the browser: it needs to send
 * `Access-Control-Allow-Origin` on successful *and* error responses. viem's own
 * mainnet default (`https://eth.merkle.io`) is rate limited (HTTP 429) and omits
 * the CORS header on those responses, which surfaced as
 * "Cross-Origin Request Blocked" / "HTTP request failed" in the wallet modal.
 */
export const DEFAULT_MAINNET_RPC_URL = 'https://ethereum-rpc.publicnode.com'

/**
 * Resolves the mainnet RPC endpoint, preferring `VITE_RPC_URL` so a dedicated
 * provider (Alchemy, Infura, ...) can be configured per environment.
 */
export const getMainnetRpcUrl = (): string =>
  import.meta.env.VITE_RPC_URL || DEFAULT_MAINNET_RPC_URL
