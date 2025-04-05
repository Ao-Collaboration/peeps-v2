import {useCallback, useState} from 'react'

import {FillReplacement} from '../utils/traitUtils'

interface SvgLoaderResult {
  svgContent: {[key: string]: string}
  loadSvg: (filePath: string, fillReplacements?: FillReplacement[]) => Promise<void>
}

// Cache for raw SVG content only
const rawSvgCache: {[key: string]: string} = {}

export const useSvgLoader = (): SvgLoaderResult => {
  const [svgContent, setSvgContent] = useState<{[key: string]: string}>({})

  const loadSvg = useCallback(
    async (filePath: string, fillReplacements?: FillReplacement[]) => {
      try {
        // Get the raw SVG content (from cache or fetch)
        let content = rawSvgCache[filePath]
        if (!content) {
          const response = await fetch(`/traits/${filePath}`)
          content = await response.text()
          rawSvgCache[filePath] = content
        }

        // Parse the SVG content
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, 'image/svg+xml')
        const svgElement = doc.querySelector('svg')

        if (svgElement) {
          // Apply fill replacement if needed
          if (fillReplacements) {
            fillReplacements.forEach(fillReplacement => {
              const elements = svgElement.querySelectorAll(
                `[fill="${fillReplacement.currentFill}"]`,
              )
              elements.forEach(element => {
                element.setAttribute('fill', fillReplacement.replacementFill)
              })
            })
          }

          // Convert the SVG to a data URL
          const svgString = new XMLSerializer().serializeToString(svgElement)
          const blob = new Blob([svgString], {type: 'image/svg+xml'})
          const dataUrl = URL.createObjectURL(blob)
          content = dataUrl
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
