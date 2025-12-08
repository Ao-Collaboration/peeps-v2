/**
 * Shared utilities for SVG and PNG image processing
 */

/**
 * Processes SVG images by converting relative URLs to data URLs
 */
export const processSvgImages = async (
  svg: SVGSVGElement,
  svgContent: {[key: string]: string},
  loadSvg: (filePath: string) => Promise<void>,
): Promise<void> => {
  const images = Array.from(svg.querySelectorAll('image'))

  for (const image of images) {
    const href = image.getAttribute('href')
    if (!href) continue

    try {
      let url = href
      if (!href.startsWith('data:')) {
        // Check the cache first
        const filePath = href.split('/traits/')[1]
        if (filePath) {
          if (svgContent[filePath]) {
            image.setAttribute('href', svgContent[filePath])
            continue
          }
          // Cache the content for next time
          loadSvg(filePath)
        }

        // Also fetch the content here for immediate use
        if (href.startsWith('/')) {
          // Convert relative paths to absolute URLs
          url = window.location.origin + href
        }
        const response = await fetch(url)
        const blob = await response.blob()
        const reader = new FileReader()
        const dataUrl = await new Promise<string>(resolve => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
        image.setAttribute('href', dataUrl)
      }
    } catch (error) {
      console.error('Error converting image URL to data URL:', error)
    }
  }
}

/**
 * Adds a comment to an SVG element
 */
export const addSvgComment = (svg: SVGSVGElement, name?: string): void => {
  const comment = `${name ? `${name} from ` : ''}Peeps Club! Created with ❤️ by Ao Collaboration`
  const commentNode = document.createComment(comment)
  svg.insertBefore(commentNode, svg.firstChild)
}

/**
 * Converts an SVG element to a data URL
 */
export const svgToDataUrl = (svg: SVGSVGElement): string => {
  const svgData = new XMLSerializer().serializeToString(svg)
  const svgBlob = new Blob([svgData], {type: 'image/svg+xml'})
  return URL.createObjectURL(svgBlob)
}

/**
 * Converts an SVG data URL to PNG data URL
 */
export const svgDataUrlToPngDataUrl = async (svgDataUrl: string): Promise<string> => {
  const img = new Image()
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = svgDataUrl
  })

  const canvas = document.createElement('canvas')
  // Set canvas dimensions to match the SVG viewBox
  canvas.width = 1200
  canvas.height = 1200
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Fill with white background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // Draw the image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Convert to PNG data URL
  return canvas.toDataURL('image/png')
}

/**
 * Processes an SVG and returns it as a serialized string
 * This is useful for saving or sending SVG data
 */
export const getProcessedSvgString = async (
  svg: SVGSVGElement,
  svgContent: {[key: string]: string},
  loadSvg: (filePath: string) => Promise<void>,
  name?: string,
): Promise<string> => {
  // Clone the SVG to avoid modifying the original
  const svgClone = svg.cloneNode(true) as SVGSVGElement

  // Process images in the SVG
  await processSvgImages(svgClone, svgContent, loadSvg)

  // Add comment
  addSvgComment(svgClone, name)

  // Serialize to string
  return new XMLSerializer().serializeToString(svgClone)
}

/**
 * Converts an SVG element to PNG data URL
 * This is the main function that orchestrates the entire process
 */
export const svgToPngDataUrl = async (
  svg: SVGSVGElement,
  svgContent: {[key: string]: string},
  loadSvg: (filePath: string) => Promise<void>,
  name?: string,
): Promise<string> => {
  // Clone the SVG to avoid modifying the original
  const svgClone = svg.cloneNode(true) as SVGSVGElement

  // Process images in the SVG
  await processSvgImages(svgClone, svgContent, loadSvg)

  // Add comment
  addSvgComment(svgClone, name)

  // Convert to data URL
  const svgDataUrl = svgToDataUrl(svgClone)

  // Convert to PNG
  const pngDataUrl = await svgDataUrlToPngDataUrl(svgDataUrl)

  // Clean up
  URL.revokeObjectURL(svgDataUrl)

  return pngDataUrl
}

/**
 * Downloads a data URL as a file
 */
export const downloadDataUrl = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
