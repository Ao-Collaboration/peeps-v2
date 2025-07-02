import {useEffect} from 'react'

import ButtonsBar from './components/ButtonsBar'
import Canvas from './components/Canvas'
import Footer from './components/Footer'
import OrientationCheck from './components/OrientationCheck'
import SaveLoadModal from './components/SaveLoadModal'
import TraitRequestModal from './components/TraitRequestModal'
import TraitsPanel from './components/TraitsPanel'
import {useAuth} from './providers/contexts/AuthContext'
import {useCanvas} from './providers/contexts/CanvasContext'
import {usePeep} from './providers/contexts/PeepContext'
import {PeepMetadata} from './types/metadata'
import {notifyDevelopers} from './utils/adminUtils'
import {decodePeepFromString, encodePeepToString} from './utils/traitUtils'

function App() {
  const {account, setEmail} = useAuth()
  const {canvasRef} = useCanvas()
  const {peep, setPeep} = usePeep()

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
      const decoded = decodePeepFromString(encodedPeep)
      if (decoded) {
        setPeep(decoded)
      }
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [setEmail, setPeep])

  const buildUrl = (peep: PeepMetadata) => {
    const encoded = encodePeepToString(peep)
    return `${window.location.origin}${window.location.pathname}?peep=${encoded}${
      account.email ? `&fromEmail=${btoa(account.email)}` : ''
    }`
  }

  const handleSave = (newPeep: PeepMetadata) => {
    const url = buildUrl(newPeep)
    notifyDevelopers('save', newPeep, account.email, url)
    setPeep(newPeep)
  }

  const handleLoad = (newPeep: PeepMetadata) => {
    setPeep(newPeep)
  }

  const handleShare = (peep: PeepMetadata) => {
    const url = buildUrl(peep)
    notifyDevelopers('share', peep, account.email, url)
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
      <div className="h-screen w-screen overflow-hidden bg-app-gradient">
        <div className="flex h-full w-full overflow-hidden">
          <div className="h-full">
            <TraitsPanel />
          </div>
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <ButtonsBar peep={peep} />
            <div className="flex-1 overflow-hidden">
              <Canvas ref={canvasRef} />
            </div>
            <Footer />
          </div>
        </div>
        <SaveLoadModal onSave={handleSave} onLoad={handleLoad} onShare={handleShare} peep={peep} />
        <TraitRequestModal />
      </div>
    </OrientationCheck>
  )
}

export default App
