import React, {useMemo, useState} from 'react'

import {Category1, Category2, Category3, TraitData} from '../data/traits'
import {useAuth} from '../providers/contexts/AuthContext'
import {usePeep} from '../providers/contexts/PeepContext'
import {STAGE_TO_COLOR_CLASS} from '../utils/constants'
import {legalizeTraits} from '../utils/traitUtils'
import FilterDrawer from './FilterDrawer'

const TraitsPanel: React.FC = () => {
  const [activeCategory1, setActiveCategory1] = useState<Category1>('Body')
  const [activeDrawer2, setActiveDrawer2] = useState<Category2 | null>(null)
  const [activeDrawer3, setActiveDrawer3] = useState<Category3 | null>(null)

  const {traitData} = useAuth()
  const {peep, setPeep} = usePeep()

  type GroupedTraits = Partial<
    Record<Category1, Partial<Record<Category2, Partial<Record<Category3 | '', TraitData[]>>>>>
  >

  const groupedTraits = useMemo<GroupedTraits>(() => {
    const groups: GroupedTraits = {}
    traitData.forEach((trait: TraitData) => {
      const {category1, category2} = trait
      const category3 = trait.category3 ?? ''
      if (!groups[category1]) groups[category1] = {}
      if (!groups[category1]![category2]) groups[category1]![category2] = {}
      if (!groups[category1]![category2]![category3]) groups[category1]![category2]![category3] = []

      // Check if this trait is already in the array to avoid duplicates
      const existingTrait = groups[category1]![category2]![category3]!.find(t => t.id === trait.id)
      if (!existingTrait) {
        groups[category1]![category2]![category3]!.push(trait)
      }
    })
    return groups
  }, [traitData])

  // Get all traits for the currently selected category1
  const currentCategory1Traits = useMemo(() => {
    if (!activeCategory1 || !groupedTraits[activeCategory1]) return []

    const traits: TraitData[] = []
    Object.values(groupedTraits[activeCategory1] || {}).forEach(category2Group => {
      Object.values(category2Group || {}).forEach(category3Group => {
        traits.push(...(category3Group || []))
      })
    })
    return traits
  }, [activeCategory1, groupedTraits])

  // Get traits filtered by category2 when drawer is open
  const category2FilteredTraits = useMemo(() => {
    if (!activeDrawer2 || !activeCategory1 || !groupedTraits[activeCategory1]?.[activeDrawer2]) {
      return currentCategory1Traits
    }

    const traits: TraitData[] = []
    const category2Group = groupedTraits[activeCategory1]?.[activeDrawer2]
    if (category2Group) {
      Object.values(category2Group).forEach(category3Group => {
        traits.push(...(category3Group || []))
      })
    }
    return traits
  }, [activeDrawer2, activeCategory1, groupedTraits, currentCategory1Traits])

  // Get traits filtered by category3 when drawer is open
  const finalFilteredTraits = useMemo(() => {
    if (!activeDrawer3 || !activeDrawer2 || !activeCategory1) {
      return category2FilteredTraits
    }

    const category3Traits = groupedTraits[activeCategory1]?.[activeDrawer2]?.[activeDrawer3]
    return category3Traits || []
  }, [activeDrawer3, activeDrawer2, activeCategory1, groupedTraits, category2FilteredTraits])

  const handleTraitToggle = (trait: TraitData) => {
    const isSelected = peep.traits.some((t: TraitData) => t.id === trait.id)

    let newTraits = isSelected
      ? peep.traits.filter((t: TraitData) => t.id !== trait.id)
      : [...peep.traits, trait]

    newTraits = legalizeTraits(traitData, newTraits)
    setPeep({...peep, traits: newTraits})
  }

  const handleCategory2Toggle = (category2: Category2) => {
    if (activeDrawer2 === category2) {
      setActiveDrawer2(null)
      setActiveDrawer3(null)
    } else {
      setActiveDrawer2(category2)
      setActiveDrawer3(null)
    }
  }

  const handleCategory3Toggle = (category3: Category3) => {
    if (activeDrawer3 === category3) {
      setActiveDrawer3(null)
    } else {
      setActiveDrawer3(category3)
    }
  }

  // Get available category2 items for current category1
  const availableCategory2Items = useMemo(() => {
    if (!activeCategory1 || !groupedTraits[activeCategory1]) return []
    return Object.keys(groupedTraits[activeCategory1] || {}) as Category2[]
  }, [activeCategory1, groupedTraits])

  return (
    <div className="flex h-full w-full">
      {/* Category 1 buttons - always visible, one always selected */}
      <div className="flex flex-col w-16 border-r border-gray-300 bg-gray-100 items-center py-2 space-y-4">
        {Object.entries(groupedTraits).map(([category1]) => (
          <button
            key={category1}
            onClick={() => {
              setActiveCategory1(category1 as Category1)
              setActiveDrawer2(null)
              setActiveDrawer3(null)
            }}
            className={`w-10 h-10 flex items-center justify-center rounded cursor-pointer transition-all duration-200 ease-in-out ${activeCategory1 === category1 ? 'bg-gray-300' : ''}`}
          >
            <img
              src={`/icons/${category1.replace(/\//g, '-')}.svg`}
              alt={category1}
              className="w-6 h-6"
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Combined Category 2 & 3 Filter Panel */}
        <div className="w-32 border-r border-gray-200 bg-white p-2 overflow-y-auto">
          {availableCategory2Items.map(category2 => {
            const isCategory2Active = activeDrawer2 === category2
            const category2Group = groupedTraits[activeCategory1]?.[category2]
            const category3Items = category2Group
              ? (Object.keys(category2Group).filter(cat => cat !== '') as Category3[])
              : []

            return (
              <div key={category2} className="mb-2">
                <button
                  onClick={() => handleCategory2Toggle(category2)}
                  className={`block w-full text-left py-1 hover:bg-gray-100 cursor-pointer transition-all duration-150 ease-in-out ${isCategory2Active ? 'bg-gray-200' : ''}`}
                >
                  <img
                    src={`/icons/${category2.replace(/\//g, '-')}.svg`}
                    alt={category2}
                    className="w-4 h-4 inline-block mr-2"
                    onError={e => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  {category2}
                </button>

                {/* Category 3 accordion */}
                {isCategory2Active && category3Items.length > 0 && (
                  <div className="ml-4 mt-1 border-l-2 border-gray-200 pl-2 transition-all duration-200 ease-in-out animate-in slide-in-from-left-2">
                    {category3Items.map(category3 => {
                      const isCategory3Active = activeDrawer3 === category3
                      return (
                        <button
                          key={category3}
                          onClick={() => handleCategory3Toggle(category3)}
                          className={`block w-full text-left py-1 text-sm hover:bg-gray-100 cursor-pointer transition-all duration-150 ease-in-out ${isCategory3Active ? 'bg-gray-200' : ''}`}
                        >
                          <img
                            src={`/icons/${category3.replace(/\//g, '-')}.svg`}
                            alt={category3}
                            className="w-3 h-3 inline-block mr-2"
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          {category3}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Traits List - Always visible */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {activeCategory1} Traits
              {activeDrawer2 && ` - ${activeDrawer2}`}
              {activeDrawer3 && ` - ${activeDrawer3}`}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2 transition-all duration-200 ease-in-out">
            {finalFilteredTraits.map(trait => {
              const isSelected = peep.traits.some(t => t.id === trait.id)
              return (
                <div
                  key={`${trait.id}-${trait.category1}-${trait.category2}-${trait.category3}`}
                  className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <label className="flex items-center cursor-pointer text-sm text-gray-600 w-full">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTraitToggle(trait)}
                      className="mr-3"
                    />
                    <span
                      className={`${STAGE_TO_COLOR_CLASS[trait.stage]} flex-1`}
                      title={trait.stage !== 'Final' ? trait.stage : undefined}
                    >
                      {trait.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2 hidden sm:inline">
                      {trait.category2}
                      {trait.category3 && ` > ${trait.category3}`}
                    </span>
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TraitsPanel
