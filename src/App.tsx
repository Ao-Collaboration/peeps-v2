import {useEffect} from 'react'

import ButtonsBar from './components/ButtonsBar'
import Canvas from './components/Canvas'
import Footer from './components/Footer'
import OrientationCheck from './components/OrientationCheck'
import SaveLoadModal from './components/SaveLoadModal'
import TraitsPanel from './components/TraitsPanel'
import {TraitData} from './data/traits'
import {useAuth} from './providers/contexts/AuthContext'
import {useCanvas} from './providers/contexts/CanvasContext'
import {usePeep} from './providers/contexts/PeepContext'
import {decodeTraitsFromString, encodeTraitsToString} from './utils/traitUtils'

function App() {
  const {account, setEmail} = useAuth()
  const {canvasRef} = useCanvas()
  const {selectedTraits, currentPeepName, setSelectedTraits, setCurrentPeepName} = usePeep()

  useEffect(() => {
    // Check for peep data in URL on load
    const params = new URLSearchParams(window.location.search)
    const encodedPeep = params.get('peep')
    const userEmail = params.get('userEmail')
    const fromEmail = params.get('fromEmail')

    // Handle email parameters
    if (userEmail) {
      setEmail(userEmail)
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
      <div className="h-screen w-screen overflow-hidden bg-mint-sand-sky">
        <div className="flex h-full w-full overflow-hidden">
          <div className="w-xs h-full overflow-hidden">
            <TraitsPanel onTraitsChange={handleTraitsChange} selectedTraits={selectedTraits} />
          </div>
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <ButtonsBar currentPeepName={currentPeepName} selectedTraits={selectedTraits} />
            <div className="flex-1 overflow-hidden">
              <Canvas ref={canvasRef} selectedTraits={selectedTraits} />
            </div>
            <Footer />
          </div>
        </div>
        <SaveLoadModal
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
