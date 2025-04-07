import {useCallback, useState} from 'react'

import {FillReplacement} from '../utils/traitUtils'

interface SvgLoaderResult {
  getSvgContent: (filePath: string, fillReplacements?: FillReplacement[]) => string | undefined
  loadSvg: (filePath: string, fillReplacements?: FillReplacement[]) => Promise<void>
}

// Permanent caches that will never be garbage collected
const rawSvgCache: {[key: string]: string} = {}
const rawSvgPromiseCache: {[key: string]: Promise<string>} = {}
const processedSvgPromiseCache: {[key: string]: Promise<void>} = {}

export const getSvgCacheKey = (filePath: string, fillReplacements?: FillReplacement[]): string => {
  if (!fillReplacements) return filePath
  return `${filePath}:${btoa(JSON.stringify(fillReplacements))}`
}

export const useSvgLoader = (): SvgLoaderResult => {
  const [svgContent, setSvgContent] = useState<{[key: string]: string}>({})

  const getSvgContent = useCallback(
    (filePath: string, fillReplacements?: FillReplacement[]) => {
      const cacheKey = getSvgCacheKey(filePath, fillReplacements)
      return svgContent[cacheKey]
    },
    [svgContent],
  )

  const loadSvg = useCallback(
    async (filePath: string, fillReplacements?: FillReplacement[]) => {
      const cacheKey = getSvgCacheKey(filePath, fillReplacements)

      // If we already have a promise for this exact combination, return it
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!processedSvgPromiseCache[cacheKey]) {
        return processedSvgPromiseCache[cacheKey]
      }

      // Create a new promise for the processed SVG
      const promise = (async () => {
        // Load the raw SVG if needed
        if (!rawSvgPromiseCache[filePath]) {
          rawSvgPromiseCache[filePath] = (async () => {
            try {
              // Get the raw SVG content (from cache or fetch)
              let content = rawSvgCache[filePath]
              if (!content) {
                const response = await fetch(`/traits/${filePath}`)
                content = await response.text()
                rawSvgCache[filePath] = content
              }
              return content
            } catch (error) {
              const traitName = filePath.split('/').pop()?.split('.')[0]
              console.error(`Error loading SVG ${traitName} at ${filePath}:`, error)
              throw new Error(`Error loading image for ${traitName}.`)
            }
          })()
        }

        // Wait for the raw SVG to be loaded
        const content = await rawSvgPromiseCache[filePath]

        // Parse the SVG content and apply replacements
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
          setSvgContent(prev => ({...prev, [cacheKey]: dataUrl}))
        }
      })()

      // Cache the processed SVG promise
      processedSvgPromiseCache[cacheKey] = promise
      return promise
    },
    [setSvgContent],
  )

  return {getSvgContent, loadSvg}
}
