import {useEffect} from 'react'

import {faDice, faFloppyDisk, faShareNodes} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import './App.css'
import Canvas from './components/Canvas'
import DownloadButton from './components/DownloadButton'
import OrientationCheck from './components/OrientationCheck'
import SaveLoadModal from './components/SaveLoadModal'
import TraitsPanel from './components/TraitsPanel'
import {TraitData} from './data/traits'
import {useAuth} from './providers/contexts/AuthContext'
import {useCanvas} from './providers/contexts/CanvasContext'
import {useModal} from './providers/contexts/ModalContext'
import {usePeep} from './providers/contexts/PeepContext'
import {decodeTraitsFromString, encodeTraitsToString} from './utils/traitUtils'

function App() {
  const {account, setEmail} = useAuth()
  const {canvasRef} = useCanvas()
  const {isModalOpen, openModal, closeModal} = useModal()
  const {selectedTraits, currentPeepName, setSelectedTraits, setCurrentPeepName, randomizePeep} =
    usePeep()

  useEffect(() => {
    // Check for peep data in URL on load
    const params = new URLSearchParams(window.location.search)
    const encodedPeep = params.get('peep')
    const userEmail = params.get('userEmail')
    const fromEmail = params.get('fromEmail')

    // Handle email parameters
    if (userEmail) {
      setEmail(atob(userEmail))
      window.history.replaceState({}, '', window.location.pathname)
    } else if (fromEmail) {
      console.log('Peep shared from:', atob(fromEmail))
      window.history.replaceState({}, '', window.location.pathname)
    }

    if (encodedPeep) {
      const decoded = decodeTraitsFromString(encodedPeep)
      if (decoded) {
        setSelectedTraits(decoded.traits)
        setCurrentPeepName(decoded.name)
      }
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [setEmail, setSelectedTraits, setCurrentPeepName])

  const handleTraitsChange = (traits: TraitData[]) => {
    setSelectedTraits(traits)
  }

  const handleSave = (name: string) => {
    setCurrentPeepName(name)
    closeModal()
  }

  const handleLoad = (traits: TraitData[], name: string) => {
    setSelectedTraits(traits)
    setCurrentPeepName(name)
  }

  const handleShare = (name: string, traits: TraitData[]) => {
    const encoded = encodeTraitsToString(traits, name)
    const url = `${window.location.origin}${window.location.pathname}?peep=${encoded}${
      account.email ? `&fromEmail=${btoa(account.email)}` : ''
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
                <button onClick={openModal} title="Save/Load Peep">
                  <FontAwesomeIcon icon={faFloppyDisk} />
                </button>
                <button
                  onClick={() => handleShare(currentPeepName || 'MyPeep', selectedTraits)}
                  title="Share"
                >
                  <FontAwesomeIcon icon={faShareNodes} />
                </button>
                {account.isAdmin && (
                  <>
                    <button onClick={randomizePeep} title="Randomize">
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
          onClose={closeModal}
          onSave={handleSave}
          onLoad={handleLoad}
          onShare={handleShare}
          currentTraits={selectedTraits}
          currentName={currentPeepName}
        />
      </div>
    </OrientationCheck>
  )
}

export default App
