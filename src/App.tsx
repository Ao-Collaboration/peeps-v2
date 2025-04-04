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
  const [currentPeepName, setCurrentPeepName] = useState<string>('')

  useEffect(() => {
    // Check for peep data in URL on load
    const params = new URLSearchParams(window.location.search)
    const encodedPeep = params.get('peep')

    if (encodedPeep) {
      const decoded = decodeTraitsFromString(encodedPeep)
      if (decoded) {
        setSelectedTraits(decoded.traits)
        setCurrentPeepName(decoded.name)
      }
      // Remove the query parameter
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

  const handleExport = (name: string, traits: TraitData[]) => {
    const encoded = encodeTraitsToString(traits, name)
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
              {currentPeepName && <span className="current-peep-name">{currentPeepName}</span>}
              <div className="button-group">
                <button onClick={() => setIsModalOpen(true)}>Save/Load Peep</button>
                <button onClick={() => handleExport(currentPeepName || 'MyPeep', selectedTraits)}>
                  Export Peep
                </button>
              </div>
            </div>
            <Canvas selectedTraits={selectedTraits} />
          </div>
        </div>
        <SaveLoadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onLoad={(traits, name) => handleLoad(traits, name)}
          onExport={handleExport}
          currentTraits={selectedTraits}
          currentName={currentPeepName}
        />
      </div>
    </OrientationCheck>
  )
}

export default App
