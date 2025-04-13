import {forwardRef, useEffect, useMemo, useState} from 'react'

import {useSvgLoader} from '../hooks/useSvgLoader'
import {usePeep} from '../providers/contexts/PeepContext'
import {createImageEntries} from '../utils/traitUtils'
import Spinner from './Spinner'

const Canvas = forwardRef<SVGSVGElement>((_, ref) => {
  const {getSvgContent, loadSvg} = useSvgLoader()
  const {peep, backgroundHidden} = usePeep()
  const [loadingTraits, setLoadingTraits] = useState<string[]>([])
  const [loadingErrors, setLoadingErrors] = useState<string[]>([])
  const imageEntries = useMemo(
    () => createImageEntries(peep.traits, backgroundHidden),
    [peep.traits, backgroundHidden],
  )

  useEffect(() => {
    const traitsToLoad = imageEntries
      .filter(entry => !getSvgContent(entry.filePath, entry.replacements))
      .filter(entry => entry.trait)
      .map(entry => entry.trait!.name)

    setLoadingTraits(traitsToLoad)
    setLoadingErrors([])

    // Load all SVGs into cache
    const loadPromises = imageEntries.map(entry => {
      return loadSvg(entry.filePath, entry.replacements)
        .then(() => {
          setLoadingTraits(prev => prev.filter(trait => trait !== entry.trait?.name))
        })
        .catch(error => {
          setLoadingErrors(prev => [...prev, error.message])
        })
    })

    Promise.all(loadPromises).finally(() => {
      setLoadingTraits([])
    })
  }, [imageEntries, loadSvg, getSvgContent])

  const isLoading = loadingTraits.length > 0

  return (
    <div className="flex flex-col h-full w-full overflow-hidden px-4 pb-2">
      <div className="relative h-full w-full bg-gray-50 p-4 rounded-4xl">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 justify-center items-center bg-gray-50/90 z-50 px-8 py-4 rounded-lg">
            <Spinner />
            <div className="text-sm text-center">
              <p className="text-gray-800 mb-3">Loading...</p>
              <ul className="list-none">
                {loadingTraits.map((trait, i) => (
                  <li
                    key={`${trait}-${i}`}
                    className="my-2 px-2 py-1 bg-gray-100 rounded-md text-gray-500 flex justify-between gap-2"
                  >
                    <span className="mr-2">{trait}</span>
                    <Spinner size="sm" className="inline-block" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {!isLoading && loadingErrors.length > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 justify-center items-center bg-gray-50/90 z-50 px-8 py-4 rounded-lg">
            <h2 className="text-2xl text-red-500">⚠️</h2>
            <h2 className="text-lg text-red-500">Errors...</h2>
            <ul className="list-none">
              {loadingErrors.map(error => (
                <li
                  key={error}
                  className="my-2 px-2 py-1 bg-gray-100 rounded-md text-red-600 flex justify-between gap-2"
                >
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 1200"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-w-full max-h-full object-contain"
          style={{opacity: isLoading ? 0.2 : 1}}
          onContextMenu={e => e.preventDefault()}
        >
          {imageEntries.map((entry, idx) => {
            return (
              <image
                key={`${entry.trait?.name ?? 'static'}-${idx}`}
                href={getSvgContent(entry.filePath, entry.replacements)}
                x="0"
                y="0"
                width="1200"
                height="1200"
                preserveAspectRatio="xMidYMid meet"
                style={{zIndex: idx}}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
})

Canvas.displayName = 'Canvas'

export default Canvas
