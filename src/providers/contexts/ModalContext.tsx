import {createContext, useContext} from 'react'

export type ModalType = 'saveLoad' | 'download'

interface ModalContextType {
  openModal: (type: ModalType) => void
  closeModal: (type: ModalType) => void
  isModalOpen: (type: ModalType) => boolean
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const useModal = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
