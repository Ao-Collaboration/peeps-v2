import {createContext, useContext} from 'react'

interface ModalContextType {
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const useModal = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
