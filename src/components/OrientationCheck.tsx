import {useEffect, useState} from 'react'

import './OrientationCheck.css'

const OrientationCheck = ({children}: {children: React.ReactNode}) => {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    // Check on mount and when window resizes
    checkOrientation()
    window.addEventListener('resize', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
    }
  }, [])

  if (isPortrait) {
    return (
      <div className="orientation-message">
        <div className="orientation-content">
          <div className="rotate-icon">↻</div>
          <h2>Please rotate your device</h2>
          <p>This app works best in landscape mode</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default OrientationCheck
