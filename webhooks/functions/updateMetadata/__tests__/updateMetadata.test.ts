import {Address, Hash, Hex, Secp256k1, Signature, TypedData} from 'ox'
import {describe, expect, it, vi} from 'vitest'

import type {HandlerContext, HandlerEvent, HandlerResponse} from '@netlify/functions'

import type {UpdateMetadataRequest} from '../../types'
import {handler} from '../updateMetadata'

// Mock the NFT validation function
vi.mock('../utils/nft', () => ({
  validateNFTOwnership: vi.fn().mockImplementation(async () => {
    console.log('🔧 Mocked validateNFTOwnership called - returning true')
    return true
  }),
}))

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
})
