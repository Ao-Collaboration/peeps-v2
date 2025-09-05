export interface Birthday {
  day: number
  month: number
}

export interface PeepMetadata {
  name: string
  birthday: Birthday
  //   traits: string[]; // Names of traits
}

export interface DeveloperNotification {
  action: 'save' | 'share'
  userEmail: string
  peep: PeepMetadata
  url: string
}

export interface CreatePeepEntry {
  name: string
  birthday: string
  userEmail: string
  url: string
  timestamp: Date
}

export interface TraitRequest {
  trait: string
  description: string
  userEmail: string
}

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
  pngData: string // Base64 encoded PNG data
  signature: string
  chainId: number
}

export interface UpdateMetadataResponse {
  success: boolean
  signerAddress?: string
  message?: string
  error?: string
}
