import {downloadDataUrl, getProcessedSvgString, svgToPngDataUrl} from './imageUtils'

export const downloadSvg = async (
  svg: SVGSVGElement,
  svgContent: {[key: string]: string},
  loadSvg: (filePath: string) => Promise<void>,
  name?: string,
  format: 'PNG' | 'SVG' = 'SVG',
) => {
  if (format === 'SVG') {
    // Get processed SVG string
    const svgString = await getProcessedSvgString(svg, svgContent, loadSvg, name)

    // Convert to data URL and download
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml'})
    const svgDataUrl = URL.createObjectURL(svgBlob)
    downloadDataUrl(svgDataUrl, `${name ? name + '_' : ''}Peep.svg`)
    URL.revokeObjectURL(svgDataUrl)
  } else {
    // Convert to PNG and download
    const pngDataUrl = await svgToPngDataUrl(svg, svgContent, loadSvg, name)
    downloadDataUrl(pngDataUrl, `${name ? name + '_' : ''}Peep.png`)
  }
}
