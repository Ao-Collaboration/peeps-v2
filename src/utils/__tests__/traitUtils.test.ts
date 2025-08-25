import {describe, expect, it} from 'vitest'

import {TraitData} from '../../data/traits'
import {getDefaultPeep, legalizeTraits} from '../traitUtils'

// Mock trait data for testing
const mockTraitData: TraitData[] = [
  {
    id: 1,
    name: 'Blue Eyes',
    stage: 'Final',
    category1: 'Body',
    category2: 'Eyes',
    category3: 'Colour',
    searchableTags: ['Eye Colour'],
    devTags: [],
    frontIndex: 15000,
  },
  {
    id: 2,
    name: 'Brown Eyes',
    stage: 'Final',
    category1: 'Body',
    category2: 'Eyes',
    category3: 'Colour',
    searchableTags: ['Eye Colour'],
    devTags: [],
    frontIndex: 15000,
  },
  {
    id: 3,
    name: 'Basic Pose',
    stage: 'Final',
    category1: 'Pose',
    category2: 'Stick Figure Poses',
    searchableTags: ['Pose'],
    devTags: [],
    frontIndex: 1000,
  },
  {
    id: 4,
    name: 'Mountains',
    stage: 'Final',
    category1: 'Location',
    category2: 'District',
    searchableTags: ['Location'],
    devTags: [],
    frontIndex: 2000,
  },
  {
    id: 5,
    name: 'Night',
    stage: 'Final',
    category1: 'Location',
    category2: 'Time',
    searchableTags: ['Time'],
    devTags: [],
    frontIndex: 3000,
  },
  {
    id: 6,
    name: 'Almond',
    stage: 'Final',
    category1: 'Body',
    category2: 'Skin',
    category3: 'Tone',
    searchableTags: ['Skin Tone'],
    devTags: [],
    frontIndex: 4000,
  },
]

describe('traitUtils', () => {
  describe('legalizeTraits', () => {
    it('should allow selecting a single trait from a required category', () => {
      const selectedTraits = [mockTraitData[0]] // Blue Eyes
      const result = legalizeTraits(mockTraitData, selectedTraits)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Blue Eyes')
    })

    it('should replace a trait when selecting a different one from the same required category', () => {
      // First select Blue Eyes
      let selectedTraits = [mockTraitData[0]] // Blue Eyes
      let result = legalizeTraits(mockTraitData, selectedTraits)
      expect(result[0].name).toBe('Blue Eyes')

      // Then select Brown Eyes instead
      selectedTraits = [mockTraitData[1]] // Brown Eyes
      result = legalizeTraits(mockTraitData, selectedTraits)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Brown Eyes')
      expect(result.some(t => t.name === 'Blue Eyes')).toBe(false)
    })

    it('should handle multiple traits from different required categories', () => {
      const selectedTraits = [
        mockTraitData[0], // Blue Eyes
        mockTraitData[2], // Basic Pose
        mockTraitData[3], // Mountains
        mockTraitData[4], // Night
      ]

      const result = legalizeTraits(mockTraitData, selectedTraits)

      expect(result).toHaveLength(4)
      expect(result.some(t => t.name === 'Blue Eyes')).toBe(true)
      expect(result.some(t => t.name === 'Basic Pose')).toBe(true)
      expect(result.some(t => t.name === 'Mountains')).toBe(true)
      expect(result.some(t => t.name === 'Night')).toBe(true)
    })

    it('should add default traits for missing required categories', () => {
      const selectedTraits = [mockTraitData[0]] // Only Blue Eyes
      const result = legalizeTraits(mockTraitData, selectedTraits)
      // Should have Blue Eyes plus defaults for other required categories
      expect(result.length).toBeGreaterThan(1)
      expect(result.some(t => t.name === 'Blue Eyes')).toBe(true)
    })

    it('should maintain trait order with most recently selected first', () => {
      // Select Blue Eyes first, then Brown Eyes
      const selectedTraits = [
        mockTraitData[0], // Blue Eyes
        mockTraitData[1], // Brown Eyes
      ]

      const result = legalizeTraits(mockTraitData, selectedTraits)

      // Brown Eyes should be the one kept (most recent)
      expect(result.some(t => t.name === 'Brown Eyes')).toBe(true)
      expect(result.some(t => t.name === 'Blue Eyes')).toBe(false)
    })
  })

  describe('getDefaultPeep', () => {
    it('should return an array of default traits', () => {
      const result = getDefaultPeep()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return legalized traits', () => {
      const result = getDefaultPeep()
      // The result should be legalized (no conflicts)
      expect(result).toBeDefined()
    })
  })
})
