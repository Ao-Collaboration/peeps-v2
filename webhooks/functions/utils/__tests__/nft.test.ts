import {Address} from 'ox'
import {describe, expect, it} from 'vitest'

import {extractPeepURIFromURI, getTokenURI, validateNFTOwnership} from '../nft'

describe('validateNFTOwnership', () => {
  it('should return true for valid ownership of token 0', async () => {
    const tokenId = '0'
    const ownerAddress = Address.from('0x455fef5aecaccd3a43a4bce2c303392e10f22c63')

    const result = await validateNFTOwnership(tokenId, ownerAddress)

    expect(result).toBe(true)
  })

  it('should return false for invalid ownership', async () => {
    const tokenId = '0'
    const nonOwnerAddress = Address.from('0x0000000000000000000000000000000000000000')

    const result = await validateNFTOwnership(tokenId, nonOwnerAddress)

    expect(result).toBe(false)
  })

  it('should return false for non-existent token', async () => {
    const tokenId = '999999999' // Non-existent token
    const anyAddress = Address.from('0x455fef5aecaccd3a43a4bce2c303392e10f22c63')

    const result = await validateNFTOwnership(tokenId, anyAddress)

    expect(result).toBe(false)
  })
})

describe('getTokenURI', () => {
  it('should return token URI for valid token', async () => {
    const tokenId = '0'
    const uri = await getTokenURI(tokenId)

    expect(uri).toBeTruthy()
    expect(typeof uri).toBe('string')
    expect(uri.length).toBeGreaterThan(0)
  })

  it('should throw error for non-existent token', async () => {
    const tokenId = '999999999'

    await expect(getTokenURI(tokenId)).rejects.toThrow('Failed to get tokenURI')
  })
})

describe('extractPeepURIFromURI', () => {
  it('should extract peepURI from full URL', () => {
    const tokenURI = 'https://api.peeps.club/metadata/123.json'
    const result = extractPeepURIFromURI(tokenURI)

    expect(result).toBe('123')
  })

  it('should extract peepURI from URL with path', () => {
    const tokenURI = 'https://api.peeps.club/v1/metadata/456.json'
    const result = extractPeepURIFromURI(tokenURI)

    expect(result).toBe('456')
  })

  it('should extract peepURI from relative path', () => {
    const tokenURI = 'metadata/789.json'
    const result = extractPeepURIFromURI(tokenURI)

    expect(result).toBe('789')
  })

  it('should handle URI without .json extension', () => {
    const tokenURI = 'https://api.peeps.club/metadata/123'
    const result = extractPeepURIFromURI(tokenURI)

    expect(result).toBe('123')
  })

  it('should handle URI with just filename', () => {
    const tokenURI = '123.json'
    const result = extractPeepURIFromURI(tokenURI)

    expect(result).toBe('123')
  })

  it('should return empty string for invalid URI', () => {
    const tokenURI = ''
    const result = extractPeepURIFromURI(tokenURI)

    expect(result).toBe('')
  })
})
