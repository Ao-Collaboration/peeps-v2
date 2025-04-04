import {useState} from 'react'

import './App.css'
import Canvas from './components/Canvas'
import OrientationCheck from './components/OrientationCheck'
import SaveLoadModal from './components/SaveLoadModal'
import TraitsPanel from './components/TraitsPanel'
import {TraitData} from './data/traits'
import {getDefaultPeep} from './utils/traitUtils'

function App() {
  const [selectedTraits, setSelectedTraits] = useState<TraitData[]>(getDefaultPeep())
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTraitsChange = (traits: TraitData[]) => {
    setSelectedTraits(traits)
  }

  const handleSave = (name: string, traits: TraitData[]) => {
    setIsModalOpen(false)
  }

  const handleLoad = (traits: TraitData[]) => {
    setSelectedTraits(traits)
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
