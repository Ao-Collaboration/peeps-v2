import React, {useMemo, useState} from 'react'

import {Category1, Category2, Category3, TraitData} from '../data/traits'
import {useAuth} from '../providers/contexts/AuthContext'
import {usePeep} from '../providers/contexts/PeepContext'
import {STAGE_TO_COLOR_CLASS} from '../utils/constants'
import {legalizeTraits} from '../utils/traitUtils'

const TraitsPanel: React.FC = () => {
  const [activeDrawer1, setActiveDrawer1] = useState<Category1 | null>(null)
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
      groups[category1]![category2]![category3]!.push(trait)
    })
    return groups
  }, [traitData])

  const handleTraitToggle = (trait: TraitData) => {
    const isSelected = peep.traits.some((t: TraitData) => t.name === trait.name)
    let newTraits = isSelected
      ? peep.traits.filter((t: TraitData) => t.name !== trait.name)
      : [...peep.traits, trait]
    newTraits = legalizeTraits(traitData, newTraits)
    setPeep({...peep, traits: newTraits})
  }

  return (
    <div className="flex h-full w-fit">
      <div className="flex flex-col w-16 border-r border-gray-300 bg-gray-100 items-center py-2 space-y-4">
        {Object.entries(groupedTraits).map(([category1]) => (
          <button
            key={category1}
            onClick={() => {
              setActiveDrawer1(category1 === activeDrawer1 ? null : (category1 as Category1))
              setActiveDrawer2(null)
              setActiveDrawer3(null)
            }}
            className={`w-10 h-10 flex items-center justify-center rounded ${activeDrawer1 === category1 ? 'bg-gray-300' : ''}`}
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

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`transition-all duration-300 ease-in-out ${activeDrawer1 ? 'w-48' : 'w-0'} border-r border-gray-200 bg-white p-2 overflow-y-auto`}
        >
          {activeDrawer1 &&
            Object.entries(groupedTraits[activeDrawer1] || {}).map(([category2]) => (
              <button
                key={category2}
                onClick={() => {
                  setActiveDrawer2(category2 === activeDrawer2 ? null : (category2 as Category2))
                  setActiveDrawer3(null)
                }}
                className="block w-full text-left py-1 hover:bg-gray-100"
              >
                <img
                  src={`/icons/${category2.replace(/\//g, '-')}.svg`}
                  alt={category2 || 'Uncategorized'}
                  className="w-4 h-4 inline-block mr-2"
                  onError={e => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                {category2 || 'Uncategorized'}
              </button>
            ))}
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${activeDrawer1 && activeDrawer2 ? 'w-48' : 'w-0'} border-r border-gray-200 bg-white p-2 overflow-y-auto`}
        >
          {activeDrawer1 &&
            activeDrawer2 &&
            Object.entries(groupedTraits[activeDrawer1]?.[activeDrawer2] || {}).map(
              ([category3, traits]) => (
                <div key={category3} className="mb-4">
                  <button
                    onClick={() =>
                      setActiveDrawer3(
                        category3 === activeDrawer3 ? null : (category3 as Category3),
                      )
                    }
                    className="block w-full text-left text-sm font-medium py-1 hover:bg-gray-100"
                  >
                    <img
                      src={`/icons/${category3.replace(/\//g, '-')}.svg`}
                      alt={category3 || 'Uncategorized'}
                      className="w-4 h-4 inline-block mr-2"
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    {category3 || 'Uncategorized'}
                  </button>
                  {activeDrawer3 === category3 && (
                    <ul className="list-none ml-4 mt-2">
                      {traits.map(trait => (
                        <li key={trait.name} className="mb-1.5">
                          <label className="flex items-center cursor-pointer text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={peep.traits.some(t => t.name === trait.name)}
                              onChange={() => handleTraitToggle(trait)}
                              className="mr-2"
                            />
                            <span
                              className={`${STAGE_TO_COLOR_CLASS[trait.stage]}`}
                              title={trait.stage !== 'Final' ? trait.stage : undefined}
                            >
                              {trait.name}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ),
            )}
        </div>
      </div>
    </div>
  )
}

export default TraitsPanel
