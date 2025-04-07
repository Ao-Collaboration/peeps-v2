import React, {useMemo, useState} from 'react'

import {Category1, TraitData} from '../data/traits'
import {useAuth} from '../providers/contexts/AuthContext'
import {legalizeTraits} from '../utils/traitUtils'
import './TraitsPanel.css'

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
    <div className="traits-panel">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search traits..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="traits-list">
        {Object.entries(groupedTraits).map(([selectionsCategory, headerCategories]) => (
          <div key={selectionsCategory} className="category-group">
            <h2 className="selections-category">{selectionsCategory}</h2>

            {Object.entries(headerCategories).map(([headerCategory, secondaryCategories]) => (
              <div key={headerCategory} className="subcategory-group">
                <h3 className="header-category">{headerCategory}</h3>

                {Object.entries(secondaryCategories).map(([secondaryCategory, traits]) => (
                  <div key={secondaryCategory} className="traits-group">
                    <h4 className="secondary-category">{secondaryCategory}</h4>

                    <ul className="traits-items">
                      {traits.map(trait => (
                        <li key={trait.name} className="trait-item">
                          <label className="trait-label">
                            <input
                              type="checkbox"
                              checked={selectedTraits.some(t => t.name === trait.name)}
                              onChange={() => handleTraitToggle(trait)}
                            />
                            <span
                              className={`${
                                trait.stage === 'In Quality Control' ? 'trait-quality-control' : ''
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
