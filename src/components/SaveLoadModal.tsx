import React, {useEffect, useState} from 'react'

import {TraitData} from '../data/traits'
import './SaveLoadModal.css'

interface SavedPeep {
  name: string
  traits: TraitData[]
}

interface SaveLoadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, traits: TraitData[]) => void
  onLoad: (traits: TraitData[]) => void
  currentTraits: TraitData[]
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onLoad,
  currentTraits,
}) => {
  const [savedPeeps, setSavedPeeps] = useState<SavedPeep[]>([])
  const [newPeepName, setNewPeepName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('savedPeeps')
    if (saved) {
      setSavedPeeps(JSON.parse(saved))
    }
  }, [])

  const handleSave = () => {
    if (!newPeepName.trim()) {
      setErrorMessage('Please enter a name')
      return
    }

    if (savedPeeps.some(peep => peep.name.toLowerCase() === newPeepName.trim().toLowerCase())) {
      setErrorMessage('A peep with this name already exists')
      return
    }

    const newPeep: SavedPeep = {
      name: newPeepName.trim(),
      traits: currentTraits,
    }

    const updatedPeeps = [...savedPeeps, newPeep]
    setSavedPeeps(updatedPeeps)
    localStorage.setItem('savedPeeps', JSON.stringify(updatedPeeps))
    onSave(newPeepName, currentTraits)
    setNewPeepName('')
    setErrorMessage('')
  }

  const handleLoad = (peep: SavedPeep) => {
    onLoad(peep.traits)
    onClose()
  }

  const handleUpdate = (peep: SavedPeep) => {
    const updatedPeeps = savedPeeps.map(p =>
      p.name === peep.name ? {...p, traits: currentTraits} : p,
    )
    setSavedPeeps(updatedPeeps)
    localStorage.setItem('savedPeeps', JSON.stringify(updatedPeeps))
    onClose()
  }

  const handleDelete = (peepName: string) => {
    const updatedPeeps = savedPeeps.filter(p => p.name !== peepName)
    setSavedPeeps(updatedPeeps)
    localStorage.setItem('savedPeeps', JSON.stringify(updatedPeeps))
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPeepName(e.target.value)
    setErrorMessage('')
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <div className="save-section">
          <h3>Save Current Peep</h3>
          <div className="save-container">
            <div className="save-input">
              <input
                type="text"
                value={newPeepName}
                onChange={handleNameChange}
                placeholder="Enter peep name"
                className={errorMessage ? 'error' : ''}
              />
              <button onClick={handleSave}>Save</button>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
          </div>
        </div>
        <div className="load-section">
          <h3>Saved Peeps</h3>
          <div className="saved-peeps-list">
            {savedPeeps.map((peep, index) => (
              <div key={index} className="saved-peep-item">
                <span>{peep.name}</span>
                <div className="saved-peep-actions">
                  <button onClick={() => handleLoad(peep)}>Load</button>
                  <button onClick={() => handleUpdate(peep)}>Update</button>
                  <button onClick={() => handleDelete(peep.name)} className="delete-button">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SaveLoadModal
