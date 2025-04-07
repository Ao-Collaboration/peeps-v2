import {createContext, useContext} from 'react'

import {TraitData} from '../../data/traits'

interface Account {
  email: string | null
  isAdmin: boolean
}

interface AuthContextType {
  account: Account
  setEmail: (email: string | null) => void
  traitData: TraitData[]
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
