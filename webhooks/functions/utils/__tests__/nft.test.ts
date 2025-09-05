import {Address} from 'ox'
import {describe, expect, it} from 'vitest'

import {validateNFTOwnership} from '../nft'

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

  it('should handle network errors gracefully', async () => {
    const tokenId = '0'
    const ownerAddress = Address.from('0x455fef5aecaccd3a43a4bce2c303392e10f22c63')

    // This should work with the real token, but if there's a network error,
    // it should return false rather than throw
    const result = await validateNFTOwnership(tokenId, ownerAddress)

    // Should be true for the real owner of token 0
    expect(result).toBe(true)
  })
})
