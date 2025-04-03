import React, {useState, useMemo} from 'react'
import {traitsData, TraitData} from '../data/traits'
import './TraitsPanel.css'

interface TraitsPanelProps {
  onTraitsChange: (selectedTraits: TraitData[]) => void
}

const TraitsPanel: React.FC<TraitsPanelProps> = ({onTraitsChange}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTraits, setSelectedTraits] = useState<TraitData[]>([])

  // Filter traits based on search term
  const filteredTraits = useMemo(() => {
    if (!searchTerm) return traitsData

    const lowerSearchTerm = searchTerm.toLowerCase()
    return traitsData.filter(
      trait =>
        trait.name.toLowerCase().includes(lowerSearchTerm) ||
        trait.searchableTags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)),
    )
  }, [searchTerm])

  // Group traits by category hierarchy
  const groupedTraits = useMemo(() => {
    const groups: Record<string, Record<string, Record<string, TraitData[]>>> = {}

    filteredTraits.forEach(trait => {
      const {selectionsCategory} = trait
      const headerCategory = trait.headerCategory ?? ''
      const secondaryCategory = trait.secondaryCategory ?? ''

      if (!groups[selectionsCategory]) {
        groups[selectionsCategory] = {}
      }

      if (!groups[selectionsCategory][headerCategory]) {
        groups[selectionsCategory][headerCategory] = {}
      }

      if (!groups[selectionsCategory][headerCategory][secondaryCategory]) {
        groups[selectionsCategory][headerCategory][secondaryCategory] = []
      }

      groups[selectionsCategory][headerCategory][secondaryCategory].push(trait)
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

    setSelectedTraits(newSelectedTraits)
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
                            <span>{trait.name}</span>
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
