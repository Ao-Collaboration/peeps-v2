import React, {useEffect, useState} from 'react'

import {faFloppyDisk, faFolderOpen, faShareNodes, faTrash} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {TraitData} from '../data/traits'
import {useModal} from '../providers/contexts/ModalContext'
import Button from './Button'
import Modal from './Modal'

interface SavedPeep {
  name: string
  traits: TraitData[]
}

interface SaveLoadModalProps {
  onSave: (name: string, traits: TraitData[]) => void
  onLoad: (traits: TraitData[], name: string) => void
  currentTraits: TraitData[]
  onShare: (name: string, traits: TraitData[]) => void
  currentName: string
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  onSave,
  onLoad,
  currentTraits,
  onShare,
  currentName,
}) => {
  const {isModalOpen, closeModal} = useModal()
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
    if (isModalOpen('saveLoad') && currentName) {
      setNewPeepName(currentName)
    }
  }, [isModalOpen, currentName])

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
    closeModal('saveLoad')
  }

  const handleLoad = (peep: SavedPeep) => {
    onLoad(peep.traits, peep.name)
    closeModal('saveLoad')
  }

  const handleUpdate = (peep: SavedPeep) => {
    const updatedPeeps = savedPeeps.map(p =>
      p.name === peep.name ? {...p, traits: currentTraits} : p,
    )
    setSavedPeeps(updatedPeeps)
    localStorage.setItem('savedPeeps', JSON.stringify(updatedPeeps))
    closeModal('saveLoad')
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

  if (!isModalOpen('saveLoad')) return null

  return (
    <Modal title="Save Peep" onClose={() => closeModal('saveLoad')}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPeepName}
              onChange={handleNameChange}
              placeholder="Enter peep name"
              className={`px-2 py-1 flex-1 rounded-md border border-gray-300 focus:outline-none ${errorMessage ? 'border-red-500!' : ''}`}
            />
            <Button onClick={handleSave} title="Save">
              <FontAwesomeIcon icon={faFloppyDisk} />
            </Button>
          </div>
          {errorMessage && <div className="text-red-500 text-xs">{errorMessage}</div>}
        </div>
      </div>
      <hr className="border-gray-200 my-4" />
      <div className="flex flex-col gap-4 mb-4">
        <h3 className="text-md font-bold text-gray-600">Saved Peeps</h3>
        <div className="flex flex-col gap-2">
          {savedPeeps.map((peep, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 px-4 rounded-lg bg-gray-50 border border-gray-200"
            >
              <span className="text-sm text-gray-800 mr-8">{peep.name}</span>
              <div className="flex gap-2">
                <Button onClick={() => handleLoad(peep)} title="Load">
                  <FontAwesomeIcon icon={faFolderOpen} />
                </Button>
                <Button onClick={() => handleUpdate(peep)} title="Update">
                  <FontAwesomeIcon icon={faFloppyDisk} />
                </Button>
                <Button onClick={() => onShare(peep.name, peep.traits)} title="Share">
                  <FontAwesomeIcon icon={faShareNodes} />
                </Button>
                <Button onClick={() => handleDelete(peep.name)} title="Delete" type="error">
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default SaveLoadModal
