import React from 'react'

interface ButtonProps {
  onClick: () => void
  title: string
  children: React.ReactNode
  type?: 'normal' | 'error'
}

const Button: React.FC<ButtonProps> = ({onClick, title, children, type = 'normal'}) => {
  const classColours =
    type === 'error'
      ? 'bg-orange-500 hover:bg-orange-500/50 text-white'
      : 'bg-navy-500 hover:bg-navy-500/50 text-white'
  return (
    <button
      className={`cursor-pointer px-4 py-2 ${classColours} rounded-md transition-colors`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

export default Button
