import {useCallback, useState} from 'react'

type FillReplacement = {
  currentFill: string
  replacementFill: string
}

interface SvgLoaderResult {
  svgContent: {[key: string]: string}
  loadSvg: (filePath: string, fillReplacement?: FillReplacement) => Promise<void>
}

// Cache for raw SVG content only
const rawSvgCache: {[key: string]: string} = {}

export const useSvgLoader = (): SvgLoaderResult => {
  const [svgContent, setSvgContent] = useState<{[key: string]: string}>({})

  const loadSvg = useCallback(
    async (filePath: string, fillReplacement?: FillReplacement) => {
      try {
        // Get the raw SVG content (from cache or fetch)
        let content = rawSvgCache[filePath]
        if (!content) {
          const response = await fetch(`/traits/${filePath}`)
          content = await response.text()
          rawSvgCache[filePath] = content
        }

        // Apply fill replacement if needed
        if (fillReplacement) {
          content = content.replaceAll(fillReplacement.currentFill, fillReplacement.replacementFill)
        }

        setSvgContent(prev => ({...prev, [filePath]: content}))
      } catch (error) {
        console.error('Error loading SVG:', error)
      }
    },
    [setSvgContent],
  )

  return {svgContent, loadSvg}
}
