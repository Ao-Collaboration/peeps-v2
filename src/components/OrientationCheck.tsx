import {useEffect, useState} from 'react'

import './OrientationCheck.css'

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
      <div className="orientation-message">
        <div className="orientation-content">
          <div className="rotate-icon">↻</div>
          <h2>Please rotate your device</h2>
          <p>This app requires a minimum width of {MIN_WIDTH}px</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default OrientationCheck
