import {AbiFunction, Address, RpcTransport} from 'ox'

// NFT Contract address (same as in the main app)
const NFT_CONTRACT_ADDRESS = '0x383a7b0488756b5618f4ce2bcbc608ad48f09a57'

// Define the 'ownerOf' function signature
const ownerOf = AbiFunction.from('function ownerOf(uint256) view returns (address)')

// Ethereum mainnet RPC URL - you might want to make this configurable
const RPC_URL = 'https://eth.llamarpc.com' // Using a public RPC endpoint

/**
 * Validates that the given address owns the specified NFT token
 */
export async function validateNFTOwnership(
  tokenId: string,
  ownerAddress: Address,
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
    return Address.isEqual(currentOwner, ownerAddress)
  } catch (error) {
    console.error(`Error validating ownership for token ${tokenId}:`, error)
    return false
  }
}
