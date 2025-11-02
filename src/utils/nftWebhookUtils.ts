const WEBHOOKS_URL = import.meta.env.VITE_WEBHOOKS_URL

export interface UpdateMetadataRequest {
  tokenId: string
  metadata: {
    name: string
    description: string
    image: string
    external_url: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
  }
  pngData: string // Base64 encoded PNG data URL
  signature: string
  chainId: number
}

export interface UpdateMetadataResponse {
  success: boolean
  signerAddress?: string
  message?: string
  error?: string
}

/**
 * Sends a request to update NFT metadata via the webhook
 */
export async function updateNFTMetadata(
  request: UpdateMetadataRequest,
): Promise<UpdateMetadataResponse> {
  if (!WEBHOOKS_URL) {
    throw new Error('VITE_WEBHOOKS_URL is not configured')
  }

  const response = await fetch(`${WEBHOOKS_URL}/updateMetadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return (await response.json()) as UpdateMetadataResponse
}
