import React from 'react'

import {faXmark} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  'data-modal'?: string
}

const Modal: React.FC<ModalProps> = ({title, onClose, children, 'data-modal': dataModal}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg p-6 max-w-[100vw] max-h-[100vh] overflow-y-auto"
        data-modal={dataModal}
      >
        <div className="flex justify-between items-center mb-4 top-0 bg-white">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
