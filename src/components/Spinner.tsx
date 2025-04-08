import React from 'react'

interface SpinnerProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const sizeMap = {
  xs: 'w-3 h-3 border-2',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-3',
  lg: 'w-10 h-10 border-4',
}

export const Spinner: React.FC<SpinnerProps> = ({className = '', size = 'lg'}) => {
  return (
    <div
      className={`${sizeMap[size]} border-gray-200 border-t-blue-500 rounded-full animate-spin ${className}`}
    />
  )
}

export default Spinner
