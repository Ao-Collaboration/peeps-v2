import React, {useMemo, useState} from 'react'

import {Category1, TraitData} from '../data/traits'
import {useAuth} from '../providers/contexts/AuthContext'
import {legalizeTraits} from '../utils/traitUtils'

interface TraitsPanelProps {
  onTraitsChange: (selectedTraits: TraitData[]) => void
  selectedTraits: TraitData[]
}

const TraitsPanel: React.FC<TraitsPanelProps> = ({onTraitsChange, selectedTraits}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const {traitData} = useAuth()
  // Filter traits based on search term
  const filteredTraits = useMemo(() => {
    if (!searchTerm) return traitData

    const lowerSearchTerm = searchTerm.toLowerCase()
    return traitData.filter(
      trait =>
        trait.name.toLowerCase().includes(lowerSearchTerm) ||
        trait.category1?.toLowerCase().includes(lowerSearchTerm) ||
        trait.category2?.toLowerCase().includes(lowerSearchTerm) ||
        trait.category3?.toLowerCase().includes(lowerSearchTerm) ||
        trait.zoomArea?.toLowerCase().includes(lowerSearchTerm) ||
        trait.searchableTags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)),
    )
  }, [traitData, searchTerm])

  // Group traits by category hierarchy
  const groupedTraits = useMemo(() => {
    const groups: Record<Category1, Record<string, Record<string, TraitData[]>>> = {
      Location: {},
      Body: {},
      Pose: {},
      Clothing: {},
      Accessory: {},
    }

    filteredTraits.forEach(trait => {
      const {category1} = trait
      const category2 = trait.category2 ?? ''
      const category3 = trait.category3 ?? ''

      if (!groups[category1]) {
        groups[category1] = {}
      }

      if (!groups[category1][category2]) {
        groups[category1][category2] = {}
      }

      if (!groups[category1][category2][category3]) {
        groups[category1][category2][category3] = []
      }

      groups[category1][category2][category3].push(trait)
    })

    return groups
  }, [filteredTraits])

  const handleTraitToggle = (trait: TraitData) => {
    const isSelected = selectedTraits.some(t => t.name === trait.name)

    let newSelectedTraits: TraitData[]
    if (isSelected) {
      newSelectedTraits = selectedTraits.filter(t => t.name !== trait.name)
    } else {
      newSelectedTraits = [...selectedTraits, trait]
    }

    newSelectedTraits = legalizeTraits(traitData, newSelectedTraits)
    onTraitsChange(newSelectedTraits)
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col border-r border-gray-200 bg-gray-50 px-4">
      <div className="my-2">
        <input
          type="text"
          placeholder="Search traits..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex-1 overflow-y-auto my-2">
        {Object.entries(groupedTraits).map(([selectionsCategory, headerCategories]) => (
          <div key={selectionsCategory} className="mb-4">
            <h2 className="font-bold border-b border-gray-200 pb-2 mb-2">{selectionsCategory}</h2>

            {Object.entries(headerCategories).map(([headerCategory, secondaryCategories]) => (
              <div key={headerCategory} className="ml-2 mb-4">
                <h3 className="font-bold mb-2 text-gray-700">{headerCategory}</h3>

                {Object.entries(secondaryCategories).map(([secondaryCategory, traits]) => (
                  <div key={secondaryCategory} className="ml-2 mb-2">
                    <h4 className="font-bold text-sm mb-2 text-gray-500">{secondaryCategory}</h4>

                    <ul className="list-none ml-2">
                      {traits.map(trait => (
                        <li key={trait.name} className="mb-1.5">
                          <label className="flex items-center cursor-pointer text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={selectedTraits.some(t => t.name === trait.name)}
                              onChange={() => handleTraitToggle(trait)}
                              className="mr-2"
                            />
                            <span
                              className={`${
                                trait.stage === 'In Quality Control' ? 'text-red-400' : ''
                              }`}
                            >
                              {trait.name}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TraitsPanel
