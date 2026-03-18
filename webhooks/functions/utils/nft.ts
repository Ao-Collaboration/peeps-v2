import {AbiFunction, Address, RpcTransport} from 'ox'

// NFT Contract address (same as in the main app)
const NFT_CONTRACT_ADDRESS = '0x383a7b0488756b5618f4ce2bcbc608ad48f09a57'

// Define function signatures
const ownerOf = AbiFunction.from('function ownerOf(uint256) view returns (address)')
const tokenURI = AbiFunction.from('function tokenURI(uint256) view returns (string)')

// Ethereum mainnet RPC URL - you might want to make this configurable
const RPC_URL = process.env.ETH_RPC_URL || 'https://eth.llamarpc.com' // Using a public RPC endpoint

/**
 * Validates that the given address owns the specified NFT token
 */
export async function validateNFTOwnership(
  tokenId: string,
  ownerAddress: string,
): Promise<boolean> {
  try {
    // Encode the function call with the tokenId
    const data = AbiFunction.encodeData(ownerOf, [BigInt(tokenId)])

    // Set up the RPC transport
    const transport = RpcTransport.fromHttp(RPC_URL)

    // Perform the eth_call to get the current owner
    const result = await transport.request({
      method: 'eth_call',
      params: [
        {
          to: NFT_CONTRACT_ADDRESS,
          data,
        },
        'latest',
      ],
    })

    // Decode the result to get the owner's address
    const currentOwner = AbiFunction.decodeResult(ownerOf, result)

    // Compare the current owner with the provided ownerAddress
    const isOwner = Address.isEqual(currentOwner, Address.from(ownerAddress))
    if (!isOwner) {
      console.error(
        `Ownership mismatch for token ${tokenId}: currentOwner=${currentOwner}, ownerAddress=${ownerAddress}`,
      )
    }
    return isOwner
  } catch (error) {
    console.error(`Error validating ownership for token ${tokenId}:`, error)
    return false
  }
}

/**
 * Calls tokenURI on the contract to get the current URI
 */
export async function getTokenURI(tokenId: string): Promise<string> {
  try {
    // Encode the function call with the tokenId
    const data = AbiFunction.encodeData(tokenURI, [BigInt(tokenId)])

    // Set up the RPC transport
    const transport = RpcTransport.fromHttp(RPC_URL)

    // Perform the eth_call to get the token URI
    const result = await transport.request({
      method: 'eth_call',
      params: [
        {
          to: NFT_CONTRACT_ADDRESS,
          data,
        },
        'latest',
      ],
    })

    // Decode the result to get the URI string
    const uri = AbiFunction.decodeResult(tokenURI, result)
    return uri
  } catch (error) {
    console.error(`Error getting tokenURI for token ${tokenId}:`, error)
    throw new Error(
      `Failed to get tokenURI: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Extracts the peepURI value from a tokenURI
 * tokenURI returns: baseURI + peepURI + ".json"
 * This extracts just the filename (peepURI.json) or the peepURI value
 * For example: "https://api.peeps.club/metadata/123.json" -> "123.json" or 123
 */
export function extractPeepURIFromURI(tokenURI: string): string {
  try {
    const url = new URL(tokenURI)
    const pathParts = url.pathname.split('/').filter(part => part.length > 0)
    const filename = pathParts[pathParts.length - 1] || ''
    // Remove .json extension to get just the peepURI value
    return filename.replace(/\.json$/, '')
  } catch {
    // If URI is not a full URL, treat it as a path
    const pathParts = tokenURI.split('/').filter(part => part.length > 0)
    const filename = pathParts[pathParts.length - 1] || ''
    return filename.replace(/\.json$/, '')
  }
}
