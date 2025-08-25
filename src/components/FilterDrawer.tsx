import React from 'react'

interface FilterDrawerProps<T> {
  isOpen: boolean
  width: string
  title?: string
  items: T[]
  renderItem: (item: T, isActive: boolean, onClick: () => void) => React.ReactNode
  activeItem: T | null
  onItemToggle: (item: T) => void
  className?: string
}

function FilterDrawer<T>({
  isOpen,
  width,
  title,
  items,
  renderItem,
  activeItem,
  onItemToggle,
  className = '',
}: FilterDrawerProps<T>) {
  return (
    <div
      className={`transition-all duration-300 ease-in-out ${isOpen ? width : 'w-0'} border-r border-gray-200 bg-white p-2 overflow-y-auto ${className}`}
    >
      {isOpen && title && (
        <div className="mb-2 text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
          {title}
        </div>
      )}
      {isOpen &&
        items.map(item => {
          const isActive = activeItem === item
          return (
            <div key={String(item)}>{renderItem(item, isActive, () => onItemToggle(item))}</div>
          )
        })}
    </div>
  )
}

export default FilterDrawer
