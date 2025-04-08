import {useEffect, useState} from 'react'

const MIN_WIDTH = 600

const OrientationCheck = ({children}: {children: React.ReactNode}) => {
  const [isTooNarrow, setIsTooNarrow] = useState(false)

  useEffect(() => {
    const checkWidth = () => {
      setIsTooNarrow(window.innerWidth < MIN_WIDTH)
    }

    // Check on mount and when window resizes
    checkWidth()
    window.addEventListener('resize', checkWidth)

    return () => {
      window.removeEventListener('resize', checkWidth)
    }
  }, [])

  if (isTooNarrow) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-900 z-50">
        <div className="flex flex-col gap-4 items-center text-center text-white">
          <h1 className="animate-spin text-8xl">↻</h1>
          <h2 className="text-white">Please rotate your device</h2>
          <p className="text-gray-300">This app requires a minimum width of {MIN_WIDTH}px</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default OrientationCheck
