import {useState} from 'react'

import {ModalContext, ModalType} from './contexts/ModalContext'

export const ModalProvider = ({children}: {children: React.ReactNode}) => {
  const [openModals, setOpenModals] = useState<Set<ModalType>>(new Set())

  const openModal = (type: ModalType) => {
    setOpenModals(prev => new Set(prev).add(type))
  }

  const closeModal = (type: ModalType) => {
    setOpenModals(prev => {
      const next = new Set(prev)
      next.delete(type)
      return next
    })
  }

  const isModalOpen = (type: ModalType) => openModals.has(type)

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        isModalOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}
