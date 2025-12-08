import {describe, expect, it} from 'vitest'

import {type Category1, type Category2, type Stage, type TraitData} from '../../data/traits'
import {type PeepMetadata} from '../../types/metadata'
import {type NFTMetadata, convertPeepToNFTMetadata, getUpdateTypedData} from '../nftUtils'

// Helper function to create mock TraitData
function createTrait(name: string, id: number = 1): TraitData {
  return {
    id,
    name,
    stage: 'Final' as Stage,
    category1: 'Body' as Category1,
    category2: 'Hair' as Category2,
    searchableTags: [],
    devTags: [],
  }
}

describe('convertPeepToNFTMetadata', () => {
  it('should convert basic peep metadata to NFT format', () => {
    const traits: TraitData[] = [
      {...createTrait('Rugged T-Shirt', 1), category2: 'Tops' as Category2},
      {...createTrait('Straight Jeans', 2), category2: 'Bottoms' as Category2},
      {...createTrait('Blue Eyes', 3), category2: 'Eyes' as Category2},
    ]

    const peep: PeepMetadata = {
      name: 'TestPeep',
      traits,
      birthday: {
        day: 15,
        month: 6,
      },
    }

    const result = convertPeepToNFTMetadata(peep, 'https://api.peeps.club/peep/123.png')

    expect(result).toEqual({
      name: 'TestPeep',
      description:
        'A diverse and family-friendly NFT community. Holding a Peep grants you access to members-only benefits. Visit our website and socials to learn more about Peeps Club. https://peeps.club',
      image: 'https://api.peeps.club/peep/123.png',
      external_url: 'https://peeps.club',
      attributes: [
        {trait_type: 'Tops', value: 'Rugged T-Shirt'},
        {trait_type: 'Bottoms', value: 'Straight Jeans'},
        {trait_type: 'Eyes', value: 'Blue Eyes'},
        {trait_type: 'Birthday', value: '15 June'},
        {trait_type: 'Name', value: 'TestPeep'},
      ],
    })
  })

  it('should handle empty traits', () => {
    const peep: PeepMetadata = {
      name: 'EmptyPeep',
      traits: [],
      birthday: {
        day: 1,
        month: 1,
      },
    }

    const result = convertPeepToNFTMetadata(peep, 'https://api.peeps.club/peep/empty.png')

    expect(result.name).toBe('EmptyPeep')
    expect(result.description).toBe(
      'A diverse and family-friendly NFT community. Holding a Peep grants you access to members-only benefits. Visit our website and socials to learn more about Peeps Club. https://peeps.club',
    )
    expect(result.external_url).toBe('https://peeps.club')
    expect(result.attributes).toEqual([
      {trait_type: 'Birthday', value: '1 January'},
      {trait_type: 'Name', value: 'EmptyPeep'},
    ])
  })

  it('should handle complex traits with different categories', () => {
    const traits: TraitData[] = [
      {...createTrait('Rainbow Hair', 1), category2: 'Hair' as Category2},
      {...createTrait('Space Suit', 2), category2: 'Clothing' as Category2},
      {...createTrait('Laser Sword', 3), category2: 'Accessory' as Category2},
    ]

    const peep: PeepMetadata = {
      name: 'ComplexPeep',
      traits,
      birthday: {
        day: 29,
        month: 12,
      },
    }

    const result = convertPeepToNFTMetadata(peep, 'https://api.peeps.club/peep/complex.png')

    expect(result.name).toBe('ComplexPeep')
    expect(result.attributes).toHaveLength(5) // 3 traits + birthday + name
    expect(result.attributes).toContainEqual({trait_type: 'Hair', value: 'Rainbow Hair'})
    expect(result.attributes).toContainEqual({trait_type: 'Clothing', value: 'Space Suit'})
    expect(result.attributes).toContainEqual({trait_type: 'Accessory', value: 'Laser Sword'})
    expect(result.attributes).toContainEqual({trait_type: 'Birthday', value: '29 December'})
    expect(result.attributes).toContainEqual({trait_type: 'Name', value: 'ComplexPeep'})
  })

  it('should throw error for invalid month', () => {
    const peep: PeepMetadata = {
      name: 'InvalidMonthPeep',
      traits: [],
      birthday: {
        day: 1,
        month: 13, // Invalid month
      },
    }

    expect(() => convertPeepToNFTMetadata(peep, 'https://api.peeps.club/peep/invalid.png')).toThrow(
      'Peep birthday is required and must be valid (day: 1-31, month: 1-12)',
    )
  })

  it('should throw error for empty name', () => {
    const peep: PeepMetadata = {
      name: '',
      traits: [],
      birthday: {
        day: 1,
        month: 1,
      },
    }

    expect(() => convertPeepToNFTMetadata(peep, 'https://api.peeps.club/peep/test.png')).toThrow(
      'Peep name is required and cannot be empty',
    )
  })

  it('should throw error for whitespace-only name', () => {
    const peep: PeepMetadata = {
      name: '   ',
      traits: [],
      birthday: {
        day: 1,
        month: 1,
      },
    }

    expect(() => convertPeepToNFTMetadata(peep, 'https://api.peeps.club/peep/test.png')).toThrow(
      'Peep name is required and cannot be empty',
    )
  })

  it('should throw error for invalid birthday day', () => {
    const peep: PeepMetadata = {
      name: 'TestPeep',
      traits: [],
      birthday: {
        day: 0, // Invalid day
        month: 1,
      },
    }

    expect(() => convertPeepToNFTMetadata(peep, 'https://api.peeps.club/peep/test.png')).toThrow(
      'Peep birthday is required and must be valid (day: 1-31, month: 1-12)',
    )
  })

  it('should throw error for invalid birthday month', () => {
    const peep: PeepMetadata = {
      name: 'TestPeep',
      traits: [],
      birthday: {
        day: 1,
        month: 0, // Invalid month
      },
    }

    expect(() => convertPeepToNFTMetadata(peep, 'https://api.peeps.club/peep/test.png')).toThrow(
      'Peep birthday is required and must be valid (day: 1-31, month: 1-12)',
    )
  })

  it('should throw error for missing birthday', () => {
    const peep: PeepMetadata = {
      name: 'TestPeep',
      traits: [],
      birthday: null as unknown as {day: number; month: number}, // Missing birthday
    }

    expect(() => convertPeepToNFTMetadata(peep, 'https://api.peeps.club/peep/test.png')).toThrow(
      'Peep birthday is required and must be valid (day: 1-31, month: 1-12)',
    )
  })
})

describe('getUpdateTypedData', () => {
  const mockMetadata: NFTMetadata = {
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
  }

  it('should create correct EIP-712 typed data structure', () => {
    const tokenId = BigInt(123)
    const imageHash = '0x1234567890abcdef'
    const chainId = 1

    const result = getUpdateTypedData(tokenId, mockMetadata, imageHash, chainId)

    // Check domain structure
    expect(result.domain).toEqual({
      name: 'Peeps Club',
      version: '1',
      chainId: 1,
      verifyingContract: '0x383a7b0488756b5618f4ce2bcbc608ad48f09a57',
    })

    // Check types structure
    expect(result.types).toEqual({
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
    })

    // Check primary type
    expect(result.primaryType).toBe('UpdatePeep')

    // Check message structure
    expect(result.message).toEqual({
      tokenId: BigInt(123),
      imageHash: expect.any(String), // keccak256 hash
      name: 'Test Peep',
      attributes: [
        {trait_type: 'Hair', value: 'Blue Hair'},
        {trait_type: 'Eyes', value: 'Green Eyes'},
        {trait_type: 'Birthday', value: '15 June'},
        {trait_type: 'Name', value: 'Test Peep'},
      ],
    })
  })

  it('should use the provided image hash directly', () => {
    const tokenId = BigInt(456)
    const imageHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' // 32 bytes
    const chainId = 1

    const result = getUpdateTypedData(tokenId, mockMetadata, imageHash, chainId)

    // The imageHash should be used as provided (already hashed)
    expect(result.message.imageHash).toBe(imageHash)
  })

  it('should work with mainnet chain ID', () => {
    const tokenId = BigInt(789)
    const imageHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    const chainId = 1 // Ethereum Mainnet

    const result = getUpdateTypedData(tokenId, mockMetadata, imageHash, chainId)

    expect(result.domain.chainId).toBe(1)
    expect(result.message.tokenId).toBe(BigInt(789))
  })

  it('should handle empty attributes array', () => {
    const metadataWithNoAttributes: NFTMetadata = {
      name: 'Empty Attributes Peep',
      description: 'A peep with no attributes',
      image: 'https://api.peeps.club/peep/empty.png',
      external_url: 'https://peeps.club',
      attributes: [],
    }

    const tokenId = BigInt(999)
    const imageHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const chainId = 1

    const result = getUpdateTypedData(tokenId, metadataWithNoAttributes, imageHash, chainId)

    expect(result.message.attributes).toEqual([])
    expect(result.message.name).toBe('Empty Attributes Peep')
  })

  it('should handle metadata with special characters', () => {
    const metadataWithSpecialChars: NFTMetadata = {
      name: 'Peep with "quotes" & symbols',
      description: 'A peep with special characters: @#$%^&*()',
      image: 'https://api.peeps.club/peep/special.png',
      external_url: 'https://peeps.club',
      attributes: [
        {trait_type: 'Special', value: 'Value with "quotes"'},
        {trait_type: 'Symbols', value: '!@#$%^&*()'},
      ],
    }

    const tokenId = BigInt(111)
    const imageHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    const chainId = 1

    const result = getUpdateTypedData(tokenId, metadataWithSpecialChars, imageHash, chainId)

    expect(result.message.name).toBe('Peep with "quotes" & symbols')
    expect(result.message.attributes).toEqual([
      {trait_type: 'Special', value: 'Value with "quotes"'},
      {trait_type: 'Symbols', value: '!@#$%^&*()'},
    ])
  })

  it('should handle large token IDs', () => {
    const tokenId = BigInt('123456789012345678901234567890')
    const imageHash = '0x1111111111111111111111111111111111111111111111111111111111111111'
    const chainId = 1

    const result = getUpdateTypedData(tokenId, mockMetadata, imageHash, chainId)

    expect(result.message.tokenId).toBe(BigInt('123456789012345678901234567890'))
  })

  it('should maintain consistent structure across multiple calls', () => {
    const tokenId1 = BigInt(1)
    const tokenId2 = BigInt(2)
    const imageHash = '0x2222222222222222222222222222222222222222222222222222222222222222'
    const chainId = 1

    const result1 = getUpdateTypedData(tokenId1, mockMetadata, imageHash, chainId)
    const result2 = getUpdateTypedData(tokenId2, mockMetadata, imageHash, chainId)

    // Domain and types should be identical
    expect(result1.domain).toEqual(result2.domain)
    expect(result1.types).toEqual(result2.types)
    expect(result1.primaryType).toBe(result2.primaryType)

    // Only message should differ
    expect(result1.message.tokenId).toBe(BigInt(1))
    expect(result2.message.tokenId).toBe(BigInt(2))
  })

  it('should throw error for non-mainnet chain IDs', () => {
    const testCases = [
      {chainId: 137, name: 'Polygon'},
      {chainId: 56, name: 'BSC'},
      {chainId: 42161, name: 'Arbitrum'},
      {chainId: 10, name: 'Optimism'},
      {chainId: 0, name: 'Invalid chain'},
    ]

    testCases.forEach(({chainId}) => {
      expect(() =>
        getUpdateTypedData(
          BigInt(1),
          mockMetadata,
          '0x3333333333333333333333333333333333333333333333333333333333333333',
          chainId,
        ),
      ).toThrow(
        `This feature only works on Ethereum Mainnet. Chain ID ${chainId} is not supported.`,
      )
    })
  })

  it('should work with mainnet chain ID 1', () => {
    const result = getUpdateTypedData(
      BigInt(1),
      mockMetadata,
      '0x4444444444444444444444444444444444444444444444444444444444444444',
      1,
    )
    expect(result.domain.chainId).toBe(1)
    expect(result.message.tokenId).toBe(BigInt(1))
  })
})
