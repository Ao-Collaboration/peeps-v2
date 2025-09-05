import {keccak256} from 'viem'

import {svgToPngDataUrl as sharedSvgToPngDataUrl} from './imageUtils'

/**
 * Converts a PNG data URL to binary data and hashes it
 */
export const hashPngDataUrl = (pngDataUrl: string): string => {
  // Extract the base64 data from the data URL
  const base64Data = pngDataUrl.split(',')[1]
  if (!base64Data) {
    throw new Error('Invalid PNG data URL format')
  }

  // Convert base64 to Uint8Array
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  // Hash the bytes
  return keccak256(bytes)
}

/**
 * Gets the PNG data from an SVG and returns its hash
 * This version works directly with the SVG element without needing svgContent
 */
export const getSvgPngHash = async (svg: SVGSVGElement, name?: string): Promise<`0x${string}`> => {
  // Use shared utility with empty svgContent and no-op loadSvg
  const pngDataUrl = await sharedSvgToPngDataUrl(
    svg,
    {}, // Empty svgContent since we're working directly with the SVG
    async () => {}, // No-op loadSvg since we don't need to load additional SVGs
    name,
  )

  // Hash the PNG data
  return hashPngDataUrl(pngDataUrl) as `0x${string}`
}
