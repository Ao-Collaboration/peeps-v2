import {useState} from 'react'

import './App.css'
import Canvas from './components/Canvas'
import OrientationCheck from './components/OrientationCheck'
import TraitsPanel from './components/TraitsPanel'
import {TraitData} from './data/traits'
import {getDefaultPeep} from './utils/traitUtils'

function App() {
  const [selectedTraits, setSelectedTraits] = useState<TraitData[]>(getDefaultPeep())

  const handleTraitsChange = (traits: TraitData[]) => {
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
            <Canvas selectedTraits={selectedTraits} />
          </div>
        </div>
      </div>
    </OrientationCheck>
  )
}

export default App
