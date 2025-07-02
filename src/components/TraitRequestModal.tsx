import React, {useEffect, useState} from 'react'

import {faPaperPlane} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {useAuth} from '../providers/contexts/AuthContext'
import {useModal} from '../providers/contexts/ModalContext'
import {sendTraitRequest} from '../utils/adminUtils'
import Button from './Button'
import Modal from './Modal'

const TraitRequestModal: React.FC = () => {
  const {isModalOpen, closeModal} = useModal()
  const {account, setEmail} = useAuth()
  const [traitName, setTraitName] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmailState] = useState(account.email ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isOpen = isModalOpen('traitRequest')

  useEffect(() => {
    if (isOpen) {
      setEmailState(account.email ?? '')
    }
  }, [isOpen, account.email])

  const handleSubmit = () => {
    const traitNameTrimmed = traitName.trim()
    if (!traitNameTrimmed) {
      setErrorMessage('Please enter a trait name')
      return
    }

    const descriptionTrimmed = description.trim()
    if (!descriptionTrimmed) {
      setErrorMessage('Please enter a description')
      return
    }

    const emailTrimmed = email.trim()
    if (!emailTrimmed) {
      setErrorMessage('Please enter your email')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    sendTraitRequest(traitNameTrimmed, descriptionTrimmed, emailTrimmed)
      .then(() => {
        // Update stored email if it's different from current account email
        if (emailTrimmed !== account.email) {
          setEmail(emailTrimmed)
        }
        setSuccessMessage("Thanks! We'll get right on it.")
        setTraitName('')
        setDescription('')
      })
      .catch(() => {
        setErrorMessage('Failed to send trait request. Please try again.')
        setIsSubmitting(false)
      })
  }

  const handleClose = () => {
    closeModal('traitRequest')
    setTraitName('')
    setDescription('')
    setEmailState(account.email ?? '')
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <Modal title="Request Trait" onClose={handleClose} data-modal="traitRequest">
      <div className="flex flex-col gap-4">
        <p className="text-gray-600 text-sm">
          Is there a trait missing that you want to see in Peeps? Tell us about it!
        </p>

        <div className="flex flex-col gap-2">
          <label htmlFor="traitName" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="traitName"
            type="text"
            value={traitName}
            onChange={e => setTraitName(e.target.value)}
            placeholder="Enter trait name"
            disabled={isSubmitting || !!successMessage}
            className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the trait you'd like to see"
            rows={4}
            disabled={isSubmitting || !!successMessage}
            className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmailState(e.target.value)}
            placeholder="Enter your email"
            disabled={isSubmitting || !!successMessage}
            className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

        {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}

        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} title="Close">
            Close
          </Button>
          {!successMessage && (
            <Button onClick={handleSubmit} title="Send Request">
              <FontAwesomeIcon icon={faPaperPlane} />
              {isSubmitting ? ' Sending...' : ' Send'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default TraitRequestModal
