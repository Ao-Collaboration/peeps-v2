import {useEffect, useState} from 'react'

import {TraitData, getTraitsData} from '../data/traits'
import {AuthContext} from './contexts/AuthContext'

const AdminEmailDomain = 'aocollab.tech'

interface Account {
  email: string | null
  isAdmin: boolean
}

const checkIsAdmin = (email: string | null) => {
  return email?.endsWith(`@${AdminEmailDomain}`) ?? false
}

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [account, setAccount] = useState<Account>({
    email: null,
    isAdmin: false,
  })
  const [traitData, setTraitData] = useState<TraitData[]>(getTraitsData(false))

  const setEmail = (email: string | null) => {
    if (email) {
      localStorage.setItem('userEmail', email)
      const isAdmin = checkIsAdmin(email)
      setAccount({
        email,
        isAdmin,
      })
      setTraitData(getTraitsData(isAdmin))
    } else {
      localStorage.removeItem('userEmail')
      setAccount({
        email: null,
        isAdmin: false,
      })
      setTraitData(getTraitsData(false))
    }
  }

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail')
    const isAdmin = checkIsAdmin(storedEmail)
    if (storedEmail) {
      setAccount({
        email: storedEmail,
        isAdmin,
      })
    }
    setTraitData(getTraitsData(isAdmin))
  }, [])

  return (
    <AuthContext.Provider value={{account, setEmail, traitData}}>{children}</AuthContext.Provider>
  )
}
