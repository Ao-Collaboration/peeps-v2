export const downloadSvg = async (
  svg: SVGSVGElement,
  svgContent: {[key: string]: string},
  loadSvg: (filePath: string) => Promise<void>,
  name?: string,
  format: 'PNG' | 'SVG' = 'SVG',
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

  // Add comment to SVG
  const comment = `${name ? `${name} from ` : ''}Peeps Club! Created with ❤️ by Ao Collaboration`
  const commentNode = document.createComment(comment)
  const svgClone = svg.cloneNode(true) as SVGSVGElement
  svgClone.insertBefore(commentNode, svgClone.firstChild)

  // Serialize the SVG
  const svgData = new XMLSerializer().serializeToString(svgClone)
  const svgBlob = new Blob([svgData], {type: 'image/svg+xml'})
  const svgUrl = URL.createObjectURL(svgBlob)

  if (format === 'SVG') {
    // Download as SVG
    const link = document.createElement('a')
    link.href = svgUrl
    link.download = `${name ? name + '_' : ''}Peep.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(svgUrl)
  } else {
    // Convert to PNG
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = svgUrl
    })

    const canvas = document.createElement('canvas')
    // Set canvas dimensions to match the SVG viewBox
    canvas.width = 1200
    canvas.height = 1200
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Fill with white background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Convert to PNG and download
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = `${name ? name + '_' : ''}Peep.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    URL.revokeObjectURL(svgUrl)
  }
}
