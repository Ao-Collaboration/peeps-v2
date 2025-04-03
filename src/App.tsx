import React, {useState} from 'react'
import './App.css'
import TraitsPanel from './components/TraitsPanel'
import Canvas from './components/Canvas'
import {TraitData} from './data/traits'

function App() {
  const [selectedTraits, setSelectedTraits] = useState<TraitData[]>([])

  const handleTraitsChange = (traits: TraitData[]) => {
    setSelectedTraits(traits)
  }

  return (
    <div className="App">
      <div className="app-container">
        <div className="left-panel">
          <TraitsPanel onTraitsChange={handleTraitsChange} />
        </div>
        <div className="right-panel">
          <Canvas selectedTraits={selectedTraits} />
        </div>
      </div>
    </div>
  )
}

export default App
