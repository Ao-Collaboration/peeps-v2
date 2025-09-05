import {describe, expect, it, vi} from 'vitest'

import {fireEvent, render, screen} from '@testing-library/react'

import {AuthProvider} from '../../providers/AuthProvider'
import {ModalProvider} from '../../providers/ModalProvider'
import {PeepProvider} from '../../providers/PeepProvider'
import {mockTraitData} from '../../test/mockData'
import TraitsPanel from '../TraitsPanel'

// Mock the providers
const MockProviders = ({children}: {children: React.ReactNode}) => (
  <AuthProvider>
    <PeepProvider>
      <ModalProvider>{children}</ModalProvider>
    </PeepProvider>
  </AuthProvider>
)

// Mock the AuthContext and useAuth hook
vi.mock('../../providers/contexts/AuthContext', () => ({
  AuthContext: {
    Provider: ({children, _value}: any) => children,
  },
  useAuth: () => ({
    traitData: mockTraitData,
    account: {email: null, isAdmin: false},
    setEmail: vi.fn(),
  }),
}))

vi.mock('../../providers/contexts/PeepContext', () => ({
  PeepContext: {
    Provider: ({children, _value}: any) => children,
  },
  usePeep: () => ({
    peep: {
      name: 'Test Peep',
      birthday: {day: 1, month: 1},
      traits: [],
    },
    setPeep: vi.fn(),
  }),
}))

// Mock the traitUtils
vi.mock('../../utils/traitUtils', () => ({
  legalizeTraits: (traitData: any, traits: any) => traits,
  getDefaultPeep: () => [],
}))

// Mock the constants
vi.mock('../../utils/constants', () => ({
  STAGE_TO_COLOR_CLASS: {
    Final: 'text-black',
    'In Quality Control': 'text-yellow-600',
    Bug: 'text-red-600',
    'Art Updates': 'text-blue-600',
  },
}))

describe('TraitsPanel', () => {
  it('renders category1 buttons correctly', () => {
    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Should show all category1 options
    expect(screen.getByAltText('Accessory')).toBeInTheDocument()
    expect(screen.getByAltText('Body')).toBeInTheDocument()
    expect(screen.getByAltText('Clothing')).toBeInTheDocument()
  })

  it('shows correct traits when Accessory category1 is selected', () => {
    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Click on Accessory button
    const accessoryButton = screen.getByAltText('Accessory').closest('button')
    fireEvent.click(accessoryButton!)

    // Should show only Accessory traits
    expect(screen.getByText('Bats')).toBeInTheDocument()
    expect(screen.getByText('Dark Blue Tie')).toBeInTheDocument()

    // Should NOT show Body or Clothing traits
    expect(screen.queryByText('Black Eyes')).not.toBeInTheDocument()
    expect(screen.queryByText('Blue Eyes')).not.toBeInTheDocument()
    expect(screen.queryByText('Red Shirt')).not.toBeInTheDocument()
  })

  it('shows correct traits when Body category1 is selected', () => {
    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Click on Body button
    const bodyButton = screen.getByAltText('Body').closest('button')
    fireEvent.click(bodyButton!)

    // Should show only Body traits
    expect(screen.getByText('Black Eyes')).toBeInTheDocument()
    expect(screen.getByText('Blue Eyes')).toBeInTheDocument()

    // Should NOT show Accessory or Clothing traits
    expect(screen.queryByText('Bats')).not.toBeInTheDocument()
    expect(screen.queryByText('Dark Blue Tie')).not.toBeInTheDocument()
    expect(screen.queryByText('Red Shirt')).not.toBeInTheDocument()
  })

  it('filters by category2 when selected', () => {
    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Select Accessory category1
    const accessoryButton = screen.getByAltText('Accessory').closest('button')
    fireEvent.click(accessoryButton!)

    // Click on Animal category2 button (not the text in trait list)
    const animalButton = screen.getByRole('button', {name: /Animal/})
    fireEvent.click(animalButton)

    // Should show only Animal traits within Accessory
    expect(screen.getByText('Bats')).toBeInTheDocument()
    expect(screen.queryByText('Dark Blue Tie')).not.toBeInTheDocument()
  })

  it('filters by category3 when selected', () => {
    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Select Body category1
    const bodyButton = screen.getByAltText('Body').closest('button')
    fireEvent.click(bodyButton!)

    // Click on Eyes category2 button
    const eyesButton = screen.getByRole('button', {name: /Eyes/})
    fireEvent.click(eyesButton)

    // Click on Colour category3 button
    const colourButton = screen.getByRole('button', {name: /Colour/})
    fireEvent.click(colourButton)

    // Should show only Eye Colour traits
    expect(screen.getByText('Black Eyes')).toBeInTheDocument()
    expect(screen.getByText('Blue Eyes')).toBeInTheDocument()
  })

  it('resets category2 and category3 when changing category1', () => {
    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Select Body category1 and open category2
    const bodyButton = screen.getByAltText('Body').closest('button')
    fireEvent.click(bodyButton!)

    const eyesButton = screen.getByRole('button', {name: /Eyes/})
    fireEvent.click(eyesButton)

    // Verify category2 is open
    expect(screen.getByText('Colour')).toBeInTheDocument()

    // Switch to Accessory category1
    const accessoryButton = screen.getByAltText('Accessory').closest('button')
    fireEvent.click(accessoryButton!)

    // Category2 and category3 should be closed
    expect(screen.queryByText('Colour')).not.toBeInTheDocument()
    expect(screen.getByRole('button', {name: /Animal/})).toBeInTheDocument() // Accessory category2
  })
})
