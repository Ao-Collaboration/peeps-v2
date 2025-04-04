import {useState} from 'react'

import './App.css'
import Canvas from './components/Canvas'
import TraitsPanel from './components/TraitsPanel'
import {TraitData} from './data/traits'
import {getDefaultPeep} from './utils/constants'

function App() {
  const [selectedTraits, setSelectedTraits] = useState<TraitData[]>(getDefaultPeep())

  const handleTraitsChange = (traits: TraitData[]) => {
    setSelectedTraits(traits)
  }

  return (
    <div className="App">
      <div className="app-container">
        <div className="left-panel">
          <TraitsPanel onTraitsChange={handleTraitsChange} selectedTraits={selectedTraits} />
        </div>
        <div className="right-panel">
          <Canvas selectedTraits={selectedTraits} />
        </div>
      </div>
    </div>
  )
}

export default App
