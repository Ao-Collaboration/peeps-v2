import React from 'react'

interface ButtonProps {
  onClick: () => void
  title: string
  children: React.ReactNode
  type?: 'normal' | 'error'
  invert?: boolean
  disabled?: boolean
}

const colorStyles = {
  normal: {
    default: 'bg-navy-500 hover:bg-navy-500/50 text-white',
    inverted: 'bg-white hover:bg-white/50 text-navy-500',
  },
  error: {
    default: 'bg-orange-500 hover:bg-orange-500/50 text-white',
    inverted: 'bg-white hover:bg-white/50 text-orange-500',
  },
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  title,
  children,
  type = 'normal',
  invert = false,
  disabled = false,
}) => {
  const classColours = colorStyles[type][invert ? 'inverted' : 'default']

  return (
    <button
      className={`px-4 py-2 ${classColours} rounded-md transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
