import React, {useEffect, useState} from 'react'

import {faFloppyDisk, faFolderOpen, faShareNodes, faTrash} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {useModal} from '../providers/contexts/ModalContext'
import {usePeep} from '../providers/contexts/PeepContext'
import {PeepMetadata} from '../types/metadata'
import Button from './Button'
import Modal from './Modal'

interface SaveLoadModalProps {
  onSave: (peep: PeepMetadata) => void
  onLoad: (peep: PeepMetadata) => void
  onShare: (peep: PeepMetadata) => void
  peep: PeepMetadata
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({onSave, onLoad, onShare}) => {
  const {isModalOpen, closeModal} = useModal()
  const {peep, setPeep} = usePeep()
  const [savedPeeps, setSavedPeeps] = useState<PeepMetadata[]>([])
  const [newPeepName, setNewPeepName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('savedPeeps')
    if (saved) {
      setSavedPeeps(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (isModalOpen('saveLoad') && peep.name) {
      setNewPeepName(peep.name)
    }
  }, [isModalOpen, peep.name])

  const handleSave = () => {
    if (!newPeepName.trim()) {
      setErrorMessage('Please enter a name')
      return
    }

    if (savedPeeps.some(peep => peep.name.toLowerCase() === newPeepName.trim().toLowerCase())) {
      setErrorMessage('A peep with this name already exists')
      return
    }

    const newPeep: PeepMetadata = {
      name: newPeepName.trim(),
      traits: peep.traits,
      birthday: peep.birthday,
    }

    const updatedPeeps = [...savedPeeps, newPeep]
    setSavedPeeps(updatedPeeps)
    localStorage.setItem('savedPeeps', JSON.stringify(updatedPeeps))
    onSave(newPeep)
    setNewPeepName('')
    setErrorMessage('')
    closeModal('saveLoad')
  }

  const handleLoad = (peep: PeepMetadata) => {
    setPeep(peep)
    setNewPeepName(peep.name)
    onLoad(peep)
    closeModal('saveLoad')
  }

  const handleUpdate = (peep: PeepMetadata) => {
    const updatedPeeps = savedPeeps.map(p =>
      p.name === peep.name ? {...p, traits: peep.traits, birthday: peep.birthday} : p,
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

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLSelectElement>, type: 'day' | 'month') => {
    setPeep({
      ...peep,
      birthday: {
        ...peep.birthday,
        [type]: parseInt(e.target.value),
      },
    })
  }

  if (!isModalOpen('saveLoad')) return null

  return (
    <Modal title="Save Peep" onClose={() => closeModal('saveLoad')} data-modal="saveLoad">
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
        <div className="flex gap-2">
          <select
            value={peep.birthday.month}
            onChange={e => handleBirthdayChange(e, 'month')}
            className="px-2 py-1 rounded-md border border-gray-300 focus:outline-none"
            data-value="month"
          >
            {Array.from({length: 12}, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString('default', {
                  month: 'long',
                })}
              </option>
            ))}
          </select>
          <select
            value={peep.birthday.day}
            onChange={e => handleBirthdayChange(e, 'day')}
            className="px-2 py-1 rounded-md border border-gray-300 focus:outline-none"
            data-value="day"
          >
            {Array.from({length: 31}, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
      <hr className="border-gray-200 my-4" />
      <div className="flex flex-col gap-4 mb-4">
        <h3 className="text-md font-bold text-gray-600">Saved Peeps</h3>
        <div className="flex flex-col gap-2">
          {savedPeeps.map((peep, index) => (
            <div
              key={index}
              className="flex justify-between items-center gap-4 py-2 px-4 rounded-lg bg-gray-50 border border-gray-200"
            >
              <div className="flex flex-col">
                <span className="text-sm text-gray-800">{peep.name}</span>
                {peep.birthday && (
                  <span className="text-xs text-gray-500">
                    {new Date(2000, peep.birthday.month - 1, peep.birthday.day).toLocaleString(
                      'default',
                      {
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleLoad(peep)} title="Load">
                  <FontAwesomeIcon icon={faFolderOpen} />
                </Button>
                <Button onClick={() => handleUpdate(peep)} title="Update">
                  <FontAwesomeIcon icon={faFloppyDisk} />
                </Button>
                <Button onClick={() => onShare(peep)} title="Share">
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
