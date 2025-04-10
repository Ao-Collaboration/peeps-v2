import React from 'react'

import {faXmark} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

interface ModalProps {
  children: React.ReactNode
  title?: string
  onClose: () => void
}

const Modal: React.FC<ModalProps> = ({children, title, onClose}) => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center z-100">
      <div className="relative bg-white px-8 py-6 rounded-2xl">
        <button
          className="absolute top-1 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
        {title && <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>}
        {children}
      </div>
    </div>
  )
}

export default Modal
