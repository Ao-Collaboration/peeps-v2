import {useEffect, useState} from 'react'

import {AuthContext} from './contexts/AuthContext'

const AdminEmailDomain = 'aocollab.tech'

interface Account {
  email: string | null
  isAdmin: boolean
}

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
