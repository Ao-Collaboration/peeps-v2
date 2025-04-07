import {useState} from 'react'

import {ModalContext} from './contexts/ModalContext'

export const ModalProvider = ({children}: {children: React.ReactNode}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <ModalContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}
