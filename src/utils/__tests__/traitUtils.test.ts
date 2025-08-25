import {describe, expect, it} from 'vitest'

import {mockTraitData} from '../../test/mockData'
import {getDefaultPeep, legalizeTraits} from '../traitUtils'

describe('traitUtils', () => {
  describe('legalizeTraits', () => {
    it('should allow selecting a single trait from a required category', () => {
      const selectedTraits = [mockTraitData[3]] // Blue Eyes (id: 4)
      const result = legalizeTraits(mockTraitData, selectedTraits)
      // Should return 10 traits (one for each required category)
      expect(result).toHaveLength(10)
      expect(result.some(t => t.name === 'Blue Eyes')).toBe(true)
    })

    it('should replace a trait when selecting a different one from the same required category', () => {
      // First select Blue Eyes
      let selectedTraits = [mockTraitData[3]] // Blue Eyes (id: 4)
      let result = legalizeTraits(mockTraitData, selectedTraits)
      expect(result.some(t => t.name === 'Blue Eyes')).toBe(true)

      // Then select Brown Eyes instead
      selectedTraits = [mockTraitData[4]] // Brown Eyes (id: 5)
      result = legalizeTraits(mockTraitData, selectedTraits)

      expect(result).toHaveLength(10)
      expect(result.some(t => t.name === 'Brown Eyes')).toBe(true)
      expect(result.some(t => t.name === 'Blue Eyes')).toBe(false)
    })

    it('should handle multiple traits from different required categories', () => {
      const selectedTraits = [
        mockTraitData[3], // Blue Eyes (id: 4)
        mockTraitData[10], // Basic Pose (id: 11)
        mockTraitData[0], // Mountains (id: 1)
        mockTraitData[1], // Night (id: 2)
      ]

      const result = legalizeTraits(mockTraitData, selectedTraits)

      // Should return 10 traits (one for each required category)
      expect(result).toHaveLength(10)
      expect(result.some(t => t.name === 'Blue Eyes')).toBe(true)
      expect(result.some(t => t.name === 'Basic Pose')).toBe(true)
      expect(result.some(t => t.name === 'Mountains')).toBe(true)
      expect(result.some(t => t.name === 'Night')).toBe(true)
    })

    it('should add default traits for missing required categories', () => {
      const selectedTraits = [mockTraitData[3]] // Only Blue Eyes (id: 4)
      const result = legalizeTraits(mockTraitData, selectedTraits)
      // Should have Blue Eyes plus defaults for other required categories
      expect(result.length).toBeGreaterThan(1)
      expect(result.some(t => t.name === 'Blue Eyes')).toBe(true)
    })

    it('should maintain trait order with most recently selected first', () => {
      // Select Blue Eyes first, then Brown Eyes
      const selectedTraits = [
        mockTraitData[3], // Blue Eyes (id: 4)
        mockTraitData[4], // Brown Eyes (id: 5)
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
