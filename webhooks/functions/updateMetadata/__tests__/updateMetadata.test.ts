import {Address, Hash, Hex, Secp256k1, Signature, TypedData} from 'ox'
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest'

import type {HandlerContext, HandlerEvent, HandlerResponse} from '@netlify/functions'

import type {UpdateMetadataRequest} from '../../types'
import {handler} from '../updateMetadata'

// Mock the NFT validation function
const mockValidateNFTOwnership = vi.fn()
const mockGetTokenURI = vi.fn()
const mockExtractPeepURIFromURI = vi.fn()

vi.mock('../../utils/nft', async () => {
  const actual = await vi.importActual<typeof import('../../utils/nft')>('../../utils/nft')
  return {
    ...actual,
    validateNFTOwnership: (...args: any[]) => mockValidateNFTOwnership(...args),
    getTokenURI: (...args: any[]) => mockGetTokenURI(...args),
    extractPeepURIFromURI: (...args: any[]) => mockExtractPeepURIFromURI(...args),
  }
})

// Mock the GitHub API operations (Octokit)
const mockUpdateNFTMetadataInRepo = vi.fn()

vi.mock('../../utils/git', async () => {
  const actual = await vi.importActual<typeof import('../../utils/git')>('../../utils/git')
  return {
    ...actual,
    updateNFTMetadataInRepo: (...args: any[]) => mockUpdateNFTMetadataInRepo(...args),
  }
})

// Set up environment variables for tests
beforeAll(() => {
  process.env.PEEPS_NFT_DATA_REPO_URL = 'https://github.com/test/repo.git'
  process.env.PEEPS_NFT_DATA_BRANCH = 'main'
  process.env.PEEPS_NFT_DATA_GIT_USER_NAME = 'Test Bot'
  process.env.PEEPS_NFT_DATA_GIT_USER_EMAIL = 'test@example.com'
  process.env.PEEPS_NFT_DATA_GITHUB_TOKEN = 'test_token_12345' // Required for API operations
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  // Set default mock implementations
  mockValidateNFTOwnership.mockResolvedValue(true)
  mockGetTokenURI.mockResolvedValue('https://api.peeps.club/metadata/123.json')
  mockExtractPeepURIFromURI.mockImplementation((uri: string) => {
    console.log('🔧 Mocked extractPeepURIFromURI called with:', uri)
    return '123'
  })
  mockUpdateNFTMetadataInRepo.mockResolvedValue(undefined)
})

const TEST_PRIVATE_KEY = Secp256k1.randomPrivateKey()
const TEST_ADDRESS = Address.fromPublicKey(Secp256k1.getPublicKey({privateKey: TEST_PRIVATE_KEY}))

// Helper function to create mock Netlify events
const createMockEvent = (
  httpMethod: string,
  body?: string,
  headers: Record<string, string> = {},
): HandlerEvent => ({
  httpMethod,
  headers: {
    'content-type': 'application/json',
    origin: 'https://peeps.club',
    ...headers,
  },
  multiValueHeaders: {},
  body: body || '',
  path: '/updateMetadata',
  rawUrl: 'https://test.netlify.app/updateMetadata',
  rawQuery: '',
  queryStringParameters: {},
  multiValueQueryStringParameters: {},
  isBase64Encoded: false,
})

// Helper function to create mock context
const createMockContext = (): HandlerContext => ({
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'updateMetadata',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:updateMetadata',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/updateMetadata',
  logStreamName: '2023/01/01/[$LATEST]test-stream',
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
})

// Helper function to assert response is defined and return it
const assertResponse = (response: void | HandlerResponse): HandlerResponse => {
  expect(response).toBeDefined()
  if (!response) {
    throw new Error('Response is undefined')
  }
  return response
}

// Create a test PNG data URL (minimal valid PNG)
const createTestPngDataUrl = (): string => {
  // This is a minimal valid PNG file (1x1 transparent pixel)
  const pngData =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  return `data:image/png;base64,${pngData}`
}

// Create a test SVG string
const createTestSvgData = (): string => {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="white"/></svg>'
}

// Helper function to create test metadata
const createTestMetadata = () => ({
  name: 'Test Peep',
  description: 'A test peep for testing',
  image: 'https://api.peeps.club/peep/123.png',
  external_url: 'https://peeps.club',
  attributes: [
    {trait_type: 'Hair', value: 'Blue Hair'},
    {trait_type: 'Eyes', value: 'Green Eyes'},
    {trait_type: 'Birthday', value: '15 June'},
    {trait_type: 'Name', value: 'Test Peep'},
  ],
})

// Helper function to create EIP-712 typed data (same as in the webhook)
const createTypedData = (tokenId: string, metadata: any, imageHash: Hex.Hex, chainId: number) => {
  const domain = {
    name: 'Peeps Club',
    version: '1',
    chainId,
    verifyingContract: Address.from('0x383a7b0488756b5618f4ce2bcbc608ad48f09a57'),
  }

  const types = {
    UpdatePeep: [
      {name: 'tokenId', type: 'uint256'},
      {name: 'imageHash', type: 'bytes32'},
      {name: 'name', type: 'string'},
      {name: 'attributes', type: 'Attribute[]'},
    ],
    Attribute: [
      {name: 'trait_type', type: 'string'},
      {name: 'value', type: 'string'},
    ],
  }

  const message = {
    tokenId: BigInt(tokenId),
    imageHash: imageHash,
    name: metadata.name,
    attributes: metadata.attributes,
  }

  return {
    domain,
    types,
    primaryType: 'UpdatePeep' as const,
    message,
  }
}

// Helper function to hash PNG data (same as in the webhook)
const hashPngDataUrl = (pngDataUrl: string): Hex.Hex => {
  const base64Data = pngDataUrl.split(',')[1]
  if (!base64Data) {
    throw new Error('Invalid PNG data URL format')
  }

  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return Hash.keccak256(bytes, {as: 'Hex'})
}

describe('updateMetadata webhook', () => {
  it('should reject requests when signer does not own the NFT (ownership validation)', async () => {
    // Set mock to return false for ownership validation
    mockValidateNFTOwnership.mockResolvedValue(false)

    // 1. Create test data
    const tokenId = '123'
    const metadata = createTestMetadata()
    const pngDataUrl = createTestPngDataUrl()

    // 2. Hash the PNG data (same as webhook does)
    const imageHash = hashPngDataUrl(pngDataUrl)
    console.log('Generated image hash:', imageHash)

    // 3. Create EIP-712 typed data (same as webhook does)
    const typedData = createTypedData(tokenId, metadata, imageHash, 1)
    console.log('Created typed data:', {
      domain: typedData.domain,
      primaryType: typedData.primaryType,
      messageTokenId: typedData.message.tokenId.toString(),
      messageImageHash: typedData.message.imageHash,
      messageName: typedData.message.name,
      attributesCount: typedData.message.attributes.length,
    })

    // 4. Get the sign payload
    const signPayload = TypedData.getSignPayload(typedData)
    console.log('Sign payload (first 20 chars):', signPayload.substring(0, 20) + '...')

    // 5. Sign the typed data with our test private key
    const signature = Secp256k1.sign({
      payload: signPayload,
      privateKey: TEST_PRIVATE_KEY,
    })
    const signatureHex = Signature.toHex(signature)
    console.log('Generated signature:', signatureHex)

    // 6. Verify we can recover the correct address
    const recoveredAddress = Secp256k1.recoverAddress({
      payload: signPayload,
      signature,
    })
    console.log('Recovered address:', recoveredAddress)
    console.log('Expected address:', TEST_ADDRESS)

    // 7. Verify the recovered address matches our test address
    expect(recoveredAddress.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase())

    // 8. Create the webhook request
    const request: UpdateMetadataRequest = {
      tokenId,
      metadata,
      pngData: pngDataUrl,
      svgData: createTestSvgData(),
      signature: signatureHex,
      chainId: 1,
    }

    // 9. Create a mock Netlify event
    const mockEvent = createMockEvent('POST', JSON.stringify(request))

    // 10. Call the webhook handler
    const response = await handler(mockEvent, createMockContext())

    // 11. Verify the response - should fail due to ownership validation
    const validResponse = assertResponse(response)
    expect(validResponse.statusCode).toBe(400)

    const responseBody = JSON.parse(validResponse.body!)
    expect(responseBody.success).toBe(false)
    expect(responseBody.error).toContain('does not own NFT token')
  })

  it('should reject requests with missing required fields', async () => {
    const mockEvent = createMockEvent(
      'POST',
      JSON.stringify({
        tokenId: '123',
        // Missing other required fields
      }),
    )

    const response = await handler(mockEvent, createMockContext())

    const validResponse = assertResponse(response)
    expect(validResponse.statusCode).toBe(400)

    const responseBody = JSON.parse(validResponse.body!)
    expect(responseBody.success).toBe(false)
    expect(responseBody.error).toContain('Missing required fields')
  })

  it('should reject requests with invalid chain ID', async () => {
    const tokenId = '123'
    const metadata = createTestMetadata()
    const pngDataUrl = createTestPngDataUrl()
    const imageHash = hashPngDataUrl(pngDataUrl)
    const typedData = createTypedData(tokenId, metadata, imageHash, 1)
    const signPayload = TypedData.getSignPayload(typedData)
    const signature = Secp256k1.sign({
      payload: signPayload,
      privateKey: TEST_PRIVATE_KEY,
    })
    const signatureHex = Signature.toHex(signature)

    const request: UpdateMetadataRequest = {
      tokenId,
      metadata,
      pngData: pngDataUrl,
      svgData: createTestSvgData(),
      signature: signatureHex,
      chainId: 137, // Polygon chain ID (not supported)
    }

    const mockEvent = createMockEvent('POST', JSON.stringify(request))

    const response = await handler(mockEvent, createMockContext())

    const validResponse = assertResponse(response)
    expect(validResponse.statusCode).toBe(400)

    const responseBody = JSON.parse(validResponse.body!)
    expect(responseBody.success).toBe(false)
    expect(responseBody.error).toContain('only works on Ethereum Mainnet')
  })

  it('should reject requests with invalid PNG data', async () => {
    const tokenId = '123'
    const metadata = createTestMetadata()
    const invalidPngData = 'data:image/png;base64,invalid-data'

    const mockEvent = createMockEvent(
      'POST',
      JSON.stringify({
        tokenId,
        metadata,
        pngData: invalidPngData,
        svgData: createTestSvgData(), // Required field
        signature: '0x1234567890abcdef',
        chainId: 1,
      }),
    )

    const response = await handler(mockEvent, createMockContext())

    const validResponse = assertResponse(response)
    expect(validResponse.statusCode).toBe(400)

    const responseBody = JSON.parse(validResponse.body!)
    expect(responseBody.success).toBe(false)
    expect(responseBody.error).toContain('Invalid PNG data URL format')
  })

  it('should handle OPTIONS requests for CORS', async () => {
    const mockEvent = createMockEvent('OPTIONS')

    const response = await handler(mockEvent, createMockContext())

    const validResponse = assertResponse(response)
    expect(validResponse.statusCode).toBe(200)
    expect(validResponse.body).toBe('OK')
    expect(validResponse.headers).toHaveProperty('Access-Control-Allow-Origin')
  })

  it('should reject non-POST requests', async () => {
    const mockEvent = createMockEvent('GET')

    const response = await handler(mockEvent, createMockContext())

    const validResponse = assertResponse(response)
    expect(validResponse.statusCode).toBe(405)

    const responseBody = JSON.parse(validResponse.body!)
    expect(responseBody.error).toBe('Method Not Allowed')
  })

  it('should fail when required environment variables are missing', async () => {
    // Store original env vars
    const originalEnv = {
      PEEPS_NFT_DATA_REPO_URL: process.env.PEEPS_NFT_DATA_REPO_URL,
      PEEPS_NFT_DATA_BRANCH: process.env.PEEPS_NFT_DATA_BRANCH,
      PEEPS_NFT_DATA_GIT_USER_NAME: process.env.PEEPS_NFT_DATA_GIT_USER_NAME,
      PEEPS_NFT_DATA_GIT_USER_EMAIL: process.env.PEEPS_NFT_DATA_GIT_USER_EMAIL,
    }

    try {
      // Clear required env vars
      delete process.env.PEEPS_NFT_DATA_REPO_URL
      delete process.env.PEEPS_NFT_DATA_BRANCH
      delete process.env.PEEPS_NFT_DATA_GIT_USER_NAME
      delete process.env.PEEPS_NFT_DATA_GIT_USER_EMAIL

      const request: UpdateMetadataRequest = {
        tokenId: '123',
        metadata: {
          name: 'Test Peep',
          description: 'A test peep',
          image: 'https://example.com/image.png',
          external_url: 'https://peeps.club',
          attributes: [
            {trait_type: 'Hair', value: 'Blonde'},
            {trait_type: 'Eyes', value: 'Blue'},
          ],
        },
        pngData:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        svgData: createTestSvgData(),
        signature: '0x1234567890abcdef',
        chainId: 1,
      }
      const mockEvent = createMockEvent('POST', JSON.stringify(request))

      const response = await handler(mockEvent, createMockContext())

      const validResponse = assertResponse(response)
      expect(validResponse.statusCode).toBe(400)

      const responseBody = JSON.parse(validResponse.body!)
      expect(responseBody.success).toBe(false)
      expect(responseBody.error).toContain('Missing required environment variables')
      expect(responseBody.error).toContain('PEEPS_NFT_DATA_REPO_URL')
      expect(responseBody.error).toContain('PEEPS_NFT_DATA_BRANCH')
      expect(responseBody.error).toContain('PEEPS_NFT_DATA_GIT_USER_NAME')
      expect(responseBody.error).toContain('PEEPS_NFT_DATA_GIT_USER_EMAIL')
    } finally {
      // Restore original env vars
      Object.assign(process.env, originalEnv)
    }
  })

  it('should successfully update metadata when all validations pass', async () => {
    // Note: This test verifies the webhook works end-to-end with all mocks in place.
    // The GitHub API operations (Octokit) are fully mocked, so no real API calls will execute.

    // 1. Create test data
    const tokenId = '123'
    const metadata = createTestMetadata()
    const pngDataUrl = createTestPngDataUrl()
    const svgData = createTestSvgData()

    // 2. Hash the PNG data
    const imageHash = hashPngDataUrl(pngDataUrl)

    // 3. Create EIP-712 typed data
    const typedData = createTypedData(tokenId, metadata, imageHash, 1)

    // 4. Sign the typed data
    const signPayload = TypedData.getSignPayload(typedData)
    const signature = Secp256k1.sign({
      payload: signPayload,
      privateKey: TEST_PRIVATE_KEY,
    })
    const signatureHex = Signature.toHex(signature)

    // 5. Create the webhook request
    const request: UpdateMetadataRequest = {
      tokenId,
      metadata,
      pngData: pngDataUrl,
      svgData,
      signature: signatureHex,
      chainId: 1,
    }

    // 6. Create a mock Netlify event
    const mockEvent = createMockEvent('POST', JSON.stringify(request))

    // 7. Call the webhook handler
    // The mocks ensure:
    // - validateNFTOwnership returns true (mocked)
    // - getTokenURI returns a valid URI (mocked)
    // - extractPeepURIFromURI extracts the peepURI (mocked)
    // - updateNFTMetadataInRepo succeeds without executing real git commands (mocked)
    const response = await handler(mockEvent, createMockContext())

    // 8. Verify the response - should succeed
    const validResponse = assertResponse(response)
    expect(validResponse.statusCode).toBe(200)

    const responseBody = JSON.parse(validResponse.body!)
    expect(responseBody.success).toBe(true)
    expect(responseBody.message).toBe('Success!')
    expect(responseBody.signerAddress).toBeDefined()
    expect(responseBody.signerAddress).toBe(TEST_ADDRESS.toLowerCase())
  })
})
