import {createContext, useContext, useEffect, useState} from 'react'

interface Account {
  email: string | null
  isAdmin: boolean
}

interface AuthContextType {
  account: Account
  setEmail: (email: string | null) => void
}

const AdminEmailDomain = 'aocollab.tech'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [account, setAccount] = useState<Account>({
    email: null,
    isAdmin: false,
  })

  const setEmail = (email: string | null) => {
    if (email) {
      localStorage.setItem('userEmail', email)
      setAccount({
        email,
        isAdmin: email.endsWith(`@${AdminEmailDomain}`),
      })
    } else {
      localStorage.removeItem('userEmail')
      setAccount({
        email: null,
        isAdmin: false,
      })
    }
  }

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail')
    if (storedEmail) {
      setAccount({
        email: storedEmail,
        isAdmin: storedEmail.endsWith(`@${AdminEmailDomain}`),
      })
    }
  }, [])

  return <AuthContext.Provider value={{account, setEmail}}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
