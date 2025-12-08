import {beforeEach, describe, expect, it, vi} from 'vitest'

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

// Mock the hooks
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
  usePeep: vi.fn(),
}))

describe('TraitsPanel Trait Selection', () => {
  let mockSetPeep: ReturnType<typeof vi.fn>
  let mockPeep: any

  beforeEach(async () => {
    mockSetPeep = vi.fn()
    mockPeep = {
      name: 'Test Peep',
      birthday: {day: 1, month: 1},
      traits: [],
    }

    // Update the mock to use our local variables
    const {usePeep} = await import('../../providers/contexts/PeepContext')
    vi.mocked(usePeep).mockReturnValue({
      peep: mockPeep,
      setPeep: mockSetPeep,
      randomizePeep: vi.fn(),
      backgroundHidden: false,
      setBackgroundHidden: vi.fn(),
    })
  })

  it('should show checkboxes as unchecked when no traits are selected', () => {
    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Select Body category1
    const bodyButton = screen.getByAltText('Body').closest('button')
    fireEvent.click(bodyButton!)

    // Check that Blue Eyes checkbox is unchecked
    const blueEyesCheckbox = screen.getByRole('checkbox', {name: /Blue Eyes/})
    expect(blueEyesCheckbox).not.toBeChecked()
  })

  it('should check checkbox when trait is selected', async () => {
    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Select Body category1
    const bodyButton = screen.getByAltText('Body').closest('button')
    fireEvent.click(bodyButton!)

    // Click on Eyes category2
    const eyesButton = screen.getByRole('button', {name: /Eyes/})
    fireEvent.click(eyesButton)

    // Click on Colour category3
    const colourButton = screen.getByRole('button', {name: /Colour/})
    fireEvent.click(colourButton)

    // Click the Blue Eyes checkbox
    const blueEyesCheckbox = screen.getByRole('checkbox', {name: /Blue Eyes/})
    fireEvent.click(blueEyesCheckbox)

    // Verify setPeep was called
    expect(mockSetPeep).toHaveBeenCalled()

    // Check the arguments passed to setPeep
    const setPeepCall = mockSetPeep.mock.calls[0][0]
    // The legalizeTraits function always returns 10 traits (one for each required category)
    expect(setPeepCall.traits).toHaveLength(10)
    expect(setPeepCall.traits.some((t: any) => t.name === 'Blue Eyes')).toBe(true)
  })

  it('should uncheck previous trait when selecting a different one from same category', async () => {
    // Start with Blue Eyes selected
    mockPeep.traits = [mockTraitData[3]] // Blue Eyes (id: 4)

    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Select Body category1
    const bodyButton = screen.getByAltText('Body').closest('button')
    fireEvent.click(bodyButton!)

    // Click on Eyes category2
    const eyesButton = screen.getByRole('button', {name: /Eyes/})
    fireEvent.click(eyesButton)

    // Click on Colour category3
    const colourButton = screen.getByRole('button', {name: /Colour/})
    fireEvent.click(colourButton)

    // Blue Eyes should be checked initially
    const blueEyesCheckbox = screen.getByRole('checkbox', {name: /Blue Eyes/})
    expect(blueEyesCheckbox).toBeChecked()

    // Brown Eyes should be unchecked
    const brownEyesCheckbox = screen.getByRole('checkbox', {name: /Brown Eyes/})
    expect(brownEyesCheckbox).not.toBeChecked()

    // Click Brown Eyes checkbox
    fireEvent.click(brownEyesCheckbox)

    // Verify setPeep was called
    expect(mockSetPeep).toHaveBeenCalled()

    // Check that the new traits array contains Brown Eyes but not Blue Eyes
    const setPeepCall = mockSetPeep.mock.calls[0][0]
    expect(setPeepCall.traits.some((t: any) => t.name === 'Brown Eyes')).toBe(true)
    expect(setPeepCall.traits.some((t: any) => t.name === 'Blue Eyes')).toBe(false)
  })

  it('should maintain checkbox state when switching between categories', async () => {
    // Start with Blue Eyes selected
    mockPeep.traits = [mockTraitData[3]] // Blue Eyes (id: 4)

    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Select Body category1
    const bodyButton = screen.getByAltText('Body').closest('button')
    fireEvent.click(bodyButton!)

    // Blue Eyes should be checked
    const blueEyesCheckbox = screen.getByRole('checkbox', {name: /Blue Eyes/})
    expect(blueEyesCheckbox).toBeChecked()

    // Switch to Accessory category1
    const accessoryButton = screen.getByAltText('Accessory').closest('button')
    fireEvent.click(accessoryButton!)

    // Switch back to Body category1
    fireEvent.click(bodyButton!)

    // Blue Eyes should still be checked
    expect(blueEyesCheckbox).toBeChecked()
  })

  it('should handle multiple trait selections correctly', async () => {
    render(
      <MockProviders>
        <TraitsPanel />
      </MockProviders>,
    )

    // Select Body category1
    const bodyButton = screen.getByAltText('Body').closest('button')
    fireEvent.click(bodyButton!)

    // Select Blue Eyes
    const blueEyesCheckbox = screen.getByRole('checkbox', {name: /Blue Eyes/})
    fireEvent.click(blueEyesCheckbox)

    // Switch to Pose category1
    const poseButton = screen.getByAltText('Pose').closest('button')
    fireEvent.click(poseButton!)

    // Select Basic Pose
    const basicPoseCheckbox = screen.getByRole('checkbox', {name: /Basic Pose/})
    fireEvent.click(basicPoseCheckbox)

    // Verify setPeep was called twice
    expect(mockSetPeep).toHaveBeenCalledTimes(2)

    // Check that each call includes the expected trait
    const firstSetPeepCall = mockSetPeep.mock.calls[0][0]
    expect(firstSetPeepCall.traits.some((t: any) => t.name === 'Blue Eyes')).toBe(true)

    const finalSetPeepCall = mockSetPeep.mock.calls[1][0]
    expect(finalSetPeepCall.traits.some((t: any) => t.name === 'Basic Pose')).toBe(true)

    // Note: The component may not accumulate traits across different categories
    // Each category selection is independent
  })
})
