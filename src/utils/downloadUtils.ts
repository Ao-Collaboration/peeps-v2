import {
  addSvgComment,
  downloadDataUrl,
  processSvgImages,
  svgToDataUrl,
  svgToPngDataUrl,
} from './imageUtils'

export const downloadSvg = async (
  svg: SVGSVGElement,
  svgContent: {[key: string]: string},
  loadSvg: (filePath: string) => Promise<void>,
  name?: string,
  format: 'PNG' | 'SVG' = 'SVG',
) => {
  if (format === 'SVG') {
    // Clone the SVG to avoid modifying the original
    const svgClone = svg.cloneNode(true) as SVGSVGElement

    // Process images in the SVG
    await processSvgImages(svgClone, svgContent, loadSvg)

    // Add comment
    addSvgComment(svgClone, name)

    // Convert to data URL and download
    const svgDataUrl = svgToDataUrl(svgClone)
    downloadDataUrl(svgDataUrl, `${name ? name + '_' : ''}Peep.svg`)
    URL.revokeObjectURL(svgDataUrl)
  } else {
    // Convert to PNG and download
    const pngDataUrl = await svgToPngDataUrl(svg, svgContent, loadSvg, name)
    downloadDataUrl(pngDataUrl, `${name ? name + '_' : ''}Peep.png`)
  }
}
