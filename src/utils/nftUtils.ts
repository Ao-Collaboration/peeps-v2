import {type Address, createPublicClient, http} from 'viem'
import {mainnet} from 'viem/chains'

import {PeepMetadata} from '../types/metadata'

// NFT Contract ABI for ERC721 functions
const NFT_ABI = [
  {
    inputs: [{name: 'owner', type: 'address'}],
    name: 'balanceOf',
    outputs: [{name: 'balance', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {name: 'owner', type: 'address'},
      {name: 'index', type: 'uint256'},
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{name: 'tokenId', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{name: 'tokenId', type: 'uint256'}],
    name: 'tokenURI',
    outputs: [{name: 'uri', type: 'string'}],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const NFT_CONTRACT_ADDRESS = '0x383a7b0488756b5618f4ce2bcbc608ad48f09a57' as Address

// Create public client for reading contract data
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
}

export interface NFTItem {
  tokenId: bigint
  metadata: NFTMetadata | null
}

export interface NFTData {
  balance: bigint
  nfts: NFTItem[]
}

export async function fetchUserNFTs(userAddress: Address): Promise<NFTData> {
  try {
    // FIXME: For testing, use milkytaste.eth instead of the connected address
    // userAddress = '0x455fef5aecaccd3a43a4bce2c303392e10f22c63' as Address

    // Get balance of NFTs
    const balance = await publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'balanceOf',
      args: [userAddress],
    })

    // Get token IDs and metadata for each owned token
    const nfts: NFTItem[] = []
    for (let i = 0; i < balance; i++) {
      const tokenId = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [userAddress, BigInt(i)],
      })

      // Get token URI and fetch metadata
      let metadata: NFTMetadata | null = null
      try {
        const tokenURI = await publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: NFT_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
        })

        // FIXME This is a hack. Fetch metadata from the URI using a CORS proxy
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(tokenURI)}`
        const response = await fetch(proxyUrl)
        if (response.ok) {
          metadata = await response.json()
        }
      } catch (error) {
        console.warn(`Failed to fetch metadata for token ${tokenId}:`, error)
      }

      nfts.push({
        tokenId,
        metadata,
      })
    }

    return {
      balance,
      nfts,
    }
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    throw new Error('Failed to fetch NFT data')
  }
}

/**
 * Converts Peep metadata to NFT metadata format
 */
export function convertPeepToNFTMetadata(peep: PeepMetadata, imageUrl: string): NFTMetadata {
  // Validate required fields
  if (!peep.name || peep.name.trim() === '') {
    throw new Error('Peep name is required and cannot be empty')
  }

  if (
    !peep.birthday ||
    peep.birthday.day < 1 ||
    peep.birthday.day > 31 ||
    peep.birthday.month < 1 ||
    peep.birthday.month > 12
  ) {
    throw new Error('Peep birthday is required and must be valid (day: 1-31, month: 1-12)')
  }

  // Convert traits to attributes array using (category2 - category3) as trait_type
  const attributes = peep.traits.map(trait => ({
    trait_type: String(trait.category2 + (trait.category3 ? ' - ' + trait.category3 : '')),
    value: trait.name,
  }))

  // Add birthday as a special attribute
  const birthdayAttribute = {
    trait_type: 'Birthday',
    value: `${peep.birthday.day} ${getMonthName(peep.birthday.month)}`,
  }
  attributes.push(birthdayAttribute)

  // Add name as a special attribute
  const nameAttribute = {
    trait_type: 'Name',
    value: peep.name,
  }
  attributes.push(nameAttribute)

  // Create the NFT metadata with static values
  const nftMetadata: NFTMetadata = {
    name: peep.name,
    description:
      'A diverse and family-friendly NFT community. Holding a Peep grants you access to members-only benefits. Visit our website and socials to learn more about Peeps Club. https://peeps.club',
    image: imageUrl,
    external_url: 'https://peeps.club',
    attributes,
  }

  return nftMetadata
}

/**
 * Helper function to get month name from number
 */
function getMonthName(monthNumber: number): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return months[monthNumber - 1] || 'Unknown'
}
