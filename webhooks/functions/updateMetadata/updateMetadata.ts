import {Address, Hash, Hex, Secp256k1, Signature, TypedData} from 'ox'

import type {Handler} from '@netlify/functions'

import type {UpdateMetadataRequest, UpdateMetadataResponse} from '../types'
import {getCorsHeaders, requirePostRequest} from '../utils/event'
import {validateNFTOwnership} from '../utils/nft'

// NFT Contract address (same as in the main app)
const NFT_CONTRACT_ADDRESS = Address.from('0x383a7b0488756b5618f4ce2bcbc608ad48f09a57')

/**
 * Converts a PNG data URL to binary data and hashes it using keccak256
 * This matches the logic from the main app's imageHashUtils.ts
 */
function hashPngDataUrl(pngDataUrl: string): Hex.Hex {
  // Extract the base64 data from the data URL
  const base64Data = pngDataUrl.split(',')[1]
  if (!base64Data) {
    throw new Error('Invalid PNG data URL format')
  }

  try {
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Hash the bytes using keccak256
    return Hash.keccak256(bytes, {as: 'Hex'})
  } catch (error) {
    throw new Error('Invalid PNG data URL format')
  }
}

/**
 * Reconstructs the EIP-712 typed data for updating NFT metadata
 * This matches the structure used in the main app's nftUtils.ts
 */
function getUpdateTypedData(
  tokenId: string,
  metadata: UpdateMetadataRequest['metadata'],
  imageHash: Hex.Hex,
  chainId: number,
) {
  // Only allow mainnet (chainId 1)
  if (chainId !== 1) {
    throw new Error(
      `This feature only works on Ethereum Mainnet. Chain ID ${chainId} is not supported.`,
    )
  }

  // Create the domain separator
  const domain = {
    name: 'Peeps Club',
    version: '1',
    chainId,
    verifyingContract: NFT_CONTRACT_ADDRESS,
  }

  // Define the types structure including all metadata fields
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

  // Create the message with all metadata fields
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

const handler: Handler = async (event, context) => {
  const requireResponse = requirePostRequest(event)
  if (requireResponse) return requireResponse
  const headers = getCorsHeaders(event)

  try {
    const data: UpdateMetadataRequest = JSON.parse(event.body || '')

    // Validate required fields first
    if (!data.tokenId || !data.metadata || !data.pngData || !data.signature || !data.chainId) {
      throw new Error('Missing required fields: tokenId, metadata, pngData, signature, or chainId')
    }

    console.log('Received update metadata request:', {
      tokenId: data.tokenId,
      metadataName: data.metadata.name,
      pngDataLength: data.pngData.length,
      signature: data.signature.substring(0, 10) + '...', // Log partial signature for debugging
      chainId: data.chainId,
    })

    // Hash the PNG data to get the image hash
    const imageHash = hashPngDataUrl(data.pngData)
    console.log('Generated image hash from PNG data:', imageHash)

    // Reconstruct the EIP-712 typed data
    const typedData = getUpdateTypedData(data.tokenId, data.metadata, imageHash, data.chainId)

    console.log('Reconstructed typed data:', {
      domain: typedData.domain,
      primaryType: typedData.primaryType,
      messageTokenId: typedData.message.tokenId.toString(),
      messageImageHash: typedData.message.imageHash,
      messageName: typedData.message.name,
      attributesCount: typedData.message.attributes.length,
    })

    // Get the sign payload for EIP-712
    const signPayload = TypedData.getSignPayload(typedData)
    console.log('Sign payload (first 20 chars):', signPayload.substring(0, 20) + '...')

    // Recover the signer address from the signature
    // Convert hex signature to Signature object and recover address
    Hex.assert(data.signature)
    const signature = Signature.fromHex(Hex.from(data.signature))
    const signerAddress = Secp256k1.recoverAddress({
      payload: signPayload,
      signature,
    })

    console.log('✅ Signature verified successfully!')
    console.log('🔍 Signer address:', signerAddress)

    // Validate that the signer actually owns the NFT
    console.log('🔍 Validating NFT ownership...')
    const isOwner = await validateNFTOwnership(data.tokenId, signerAddress)
    if (!isOwner) {
      throw new Error(
        `Address ${signerAddress} does not own NFT token ${data.tokenId}. Only the current owner can update metadata.`,
      )
    }

    //TODO Update the NFT metadata

    console.log('✅ NFT ownership validated successfully!')

    const response: UpdateMetadataResponse = {
      success: true,
      signerAddress,
      message: 'Signature verified and ownership validated successfully',
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    }
  } catch (err) {
    console.error('❌ Error processing update metadata request:', err)

    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    const response: UpdateMetadataResponse = {
      success: false,
      error: errorMessage,
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify(response),
    }
  }
}

export {handler}
