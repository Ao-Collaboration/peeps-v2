import {useCallback, useState} from 'react'

import {FillReplacement} from '../utils/traitUtils'

interface SvgLoaderResult {
  svgContent: {[key: string]: string}
  loadSvg: (filePath: string, fillReplacements?: FillReplacement[]) => Promise<void>
}

// Permanent caches that will never be garbage collected
const rawSvgCache: {[key: string]: string} = {}
const promiseCache: {[key: string]: Promise<void>} = {}

export const useSvgLoader = (): SvgLoaderResult => {
  const [svgContent, setSvgContent] = useState<{[key: string]: string}>({})

  const loadSvg = useCallback(
    async (filePath: string, fillReplacements?: FillReplacement[]) => {
      // If there's already a promise for this filePath, return it
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!promiseCache[filePath]) {
        return promiseCache[filePath]
      }

      // Create a new promise and cache it
      const promise = (async () => {
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
          console.error(`Error loading SVG ${filePath}:`, error)
          throw error // Re-throw to propagate the error
        } finally {
          // Clean up the promise from the cache
          delete promiseCache[filePath]
        }
      })()

      // Cache the promise
      promiseCache[filePath] = promise
      return promise
    },
    [setSvgContent],
  )

  return {svgContent, loadSvg}
}
