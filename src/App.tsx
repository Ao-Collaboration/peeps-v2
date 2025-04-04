import {useEffect, useState} from 'react'

import './App.css'
import Canvas from './components/Canvas'
import OrientationCheck from './components/OrientationCheck'
import SaveLoadModal from './components/SaveLoadModal'
import TraitsPanel from './components/TraitsPanel'
import {TraitData} from './data/traits'
import {decodeTraitsFromString, encodeTraitsToString, getDefaultPeep} from './utils/traitUtils'

function App() {
  const [selectedTraits, setSelectedTraits] = useState<TraitData[]>(getDefaultPeep())
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Check for peep data in URL on load
    const params = new URLSearchParams(window.location.search)
    const encodedPeep = params.get('peep')

    if (encodedPeep) {
      const decoded = decodeTraitsFromString(encodedPeep)
      if (decoded) {
        setSelectedTraits(decoded.traits)
      }
      // Remove the query parameter
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const handleTraitsChange = (traits: TraitData[]) => {
    setSelectedTraits(traits)
  }

  const handleSave = (name: string, traits: TraitData[]) => {
    setIsModalOpen(false)
  }

  const handleLoad = (traits: TraitData[]) => {
    setSelectedTraits(traits)
  }

  const handleExport = () => {
    const encoded = encodeTraitsToString(selectedTraits, 'MyPeep')
    const url = `${window.location.origin}${window.location.pathname}?peep=${encoded}`
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert('Export URL copied to clipboard!')
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
              <button onClick={() => setIsModalOpen(true)}>Save/Load Peep</button>
              <button onClick={handleExport}>Export Peep</button>
            </div>
            <Canvas selectedTraits={selectedTraits} />
          </div>
        </div>
        <SaveLoadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onLoad={handleLoad}
          currentTraits={selectedTraits}
        />
      </div>
    </OrientationCheck>
  )
}

export default App
