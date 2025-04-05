import React, {useEffect, useState} from 'react'

import {
  faFloppyDisk,
  faFolderOpen,
  faShareNodes,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

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
  onLoad: (traits: TraitData[], name: string) => void
  currentTraits: TraitData[]
  onExport: (name: string, traits: TraitData[]) => void
  currentName: string
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onLoad,
  currentTraits,
  onExport,
  currentName,
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

  useEffect(() => {
    // Pre-fill the name input if we have a current name
    if (isOpen && currentName) {
      setNewPeepName(currentName)
    }
  }, [isOpen, currentName])

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
    onLoad(peep.traits, peep.name)
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
          <FontAwesomeIcon icon={faXmark} />
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
              <button onClick={handleSave} title="Save">
                <FontAwesomeIcon icon={faFloppyDisk} />
              </button>
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
                  <button onClick={() => handleLoad(peep)} title="Load">
                    <FontAwesomeIcon icon={faFolderOpen} />
                  </button>
                  <button onClick={() => handleUpdate(peep)} title="Update">
                    <FontAwesomeIcon icon={faFloppyDisk} />
                  </button>
                  <button onClick={() => onExport(peep.name, peep.traits)} title="Export">
                    <FontAwesomeIcon icon={faShareNodes} />
                  </button>
                  <button
                    onClick={() => handleDelete(peep.name)}
                    className="delete-button"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} />
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
