import {adjectives, names, uniqueNamesGenerator} from 'unique-names-generator'

import {useEffect, useRef, useState} from 'react'

import {faDice, faFloppyDisk, faShareNodes} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import './App.css'
import Canvas from './components/Canvas'
import DownloadButton from './components/DownloadButton'
import OrientationCheck from './components/OrientationCheck'
import SaveLoadModal from './components/SaveLoadModal'
import TraitsPanel from './components/TraitsPanel'
import {TraitData} from './data/traits'
import {isAdmin} from './utils/authUtils'
import {
  decodeTraitsFromString,
  encodeTraitsToString,
  getDefaultPeep,
  getRandomPeep,
} from './utils/traitUtils'

function App() {
  const [selectedTraits, setSelectedTraits] = useState<TraitData[]>(getDefaultPeep())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPeepName, setCurrentPeepName] = useState<string>('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const canvasRef = useRef<SVGSVGElement>(null)

  const generateRandomName = () => {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, names],
      separator: ' ',
      style: 'capital',
      length: 2,
    })
  }

  useEffect(() => {
    // Check for peep data in URL on load
    const params = new URLSearchParams(window.location.search)
    const encodedPeep = params.get('peep')
    const userEmail = params.get('userEmail')
    const fromEmail = params.get('fromEmail')

    // Handle email parameters
    if (userEmail) {
      // User email entry point
      localStorage.setItem('userEmail', userEmail)
      setIsAuthorized(isAdmin(userEmail))
      window.history.replaceState({}, '', window.location.pathname)
    } else if (fromEmail) {
      // Peep shared from another user
      console.log('Peep shared from:', atob(fromEmail))
      window.history.replaceState({}, '', window.location.pathname)
    } else {
      // Check stored email
      const storedEmail = localStorage.getItem('userEmail')
      setIsAuthorized(isAdmin(storedEmail))
    }

    if (encodedPeep) {
      const decoded = decodeTraitsFromString(encodedPeep)
      if (decoded) {
        setSelectedTraits(decoded.traits)
        setCurrentPeepName(decoded.name)
      }
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const handleTraitsChange = (traits: TraitData[]) => {
    setSelectedTraits(traits)
  }

  const handleSave = (name: string, traits: TraitData[]) => {
    setCurrentPeepName(name)
    setIsModalOpen(false)
  }

  const handleLoad = (traits: TraitData[], name: string) => {
    setSelectedTraits(traits)
    setCurrentPeepName(name)
  }

  const handleShare = (name: string, traits: TraitData[]) => {
    const encoded = encodeTraitsToString(traits, name)
    const userEmail = localStorage.getItem('userEmail')
    const url = `${window.location.origin}${window.location.pathname}?peep=${encoded}${
      userEmail ? `&fromEmail=${btoa(userEmail)}` : ''
    }`
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert('Share URL copied to clipboard!')
      })
      .catch(() => {
        alert('Failed to copy URL. Your peep URL is:\n' + url)
      })
  }

  return (
    <OrientationCheck>
      <div className="App">
        <div className="app-container">
          <div className="left-panel">
            <TraitsPanel onTraitsChange={handleTraitsChange} selectedTraits={selectedTraits} />
          </div>
          <div className="right-panel">
            <div className="save-load-button-container">
              {currentPeepName && <span className="current-peep-name">{currentPeepName}</span>}
              <div className="button-group">
                <button onClick={() => setIsModalOpen(true)} title="Save/Load Peep">
                  <FontAwesomeIcon icon={faFloppyDisk} />
                </button>
                <button
                  onClick={() => handleShare(currentPeepName || 'MyPeep', selectedTraits)}
                  title="Share"
                >
                  <FontAwesomeIcon icon={faShareNodes} />
                </button>
                {isAuthorized && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedTraits(getRandomPeep())
                        setCurrentPeepName(generateRandomName())
                      }}
                      title="Randomize"
                    >
                      <FontAwesomeIcon icon={faDice} />
                    </button>
                    <DownloadButton svgRef={canvasRef} currentName={currentPeepName} />
                  </>
                )}
              </div>
            </div>
            <Canvas ref={canvasRef} selectedTraits={selectedTraits} />
          </div>
        </div>
        <SaveLoadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onLoad={(traits, name) => handleLoad(traits, name)}
          onShare={handleShare}
          currentTraits={selectedTraits}
          currentName={currentPeepName}
        />
      </div>
    </OrientationCheck>
  )
}

export default App
