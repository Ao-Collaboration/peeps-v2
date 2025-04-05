export const downloadSvg = async (
  svg: SVGSVGElement,
  svgContent: {[key: string]: string},
  loadSvg: (filePath: string) => Promise<void>,
  name?: string,
) => {
  // Update the image hrefs to use data URLs
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

  // Serialize and download the SVG
  const svgData = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([svgData], {type: 'image/svg+xml'})
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${name ? name + '_' : ''}Peep.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
