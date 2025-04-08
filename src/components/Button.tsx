import React from 'react'

interface ButtonProps {
  onClick: () => void
  title: string
  children: React.ReactNode
  type?: 'normal' | 'error'
}

const Button: React.FC<ButtonProps> = ({onClick, title, children, type = 'normal'}) => {
  const classColours =
    type === 'error' ? 'bg-red-600 hover:bg-red-800' : 'bg-mint-500 hover:bg-mint-dark'
  return (
    <button
      className={`cursor-pointer px-4 py-2 ${classColours} text-white rounded-md transition-colors`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

export default Button
