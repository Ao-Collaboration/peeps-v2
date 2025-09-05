import {describe, expect, it} from 'vitest'

import {type Category1, type Category2, type Stage, type TraitData} from '../../data/traits'
import {type PeepMetadata} from '../../types/metadata'
import {convertPeepToNFTMetadata} from '../nftUtils'

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
