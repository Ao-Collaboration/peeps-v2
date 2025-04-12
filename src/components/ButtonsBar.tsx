import {
  faDice,
  faEye,
  faEyeSlash,
  faFloppyDisk,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {TraitData} from '../data/traits'
import {useAuth} from '../providers/contexts/AuthContext'
import {useCanvas} from '../providers/contexts/CanvasContext'
import {useModal} from '../providers/contexts/ModalContext'
import {usePeep} from '../providers/contexts/PeepContext'
import {encodeTraitsToString} from '../utils/traitUtils'
import Button from './Button'
import DownloadButton from './DownloadButton'

interface ButtonsBarProps {
  currentPeepName: string
  selectedTraits: TraitData[]
}

export default function ButtonsBar({currentPeepName, selectedTraits}: ButtonsBarProps) {
  const {account} = useAuth()
  const {canvasRef} = useCanvas()
  const {openModal} = useModal()
  const {randomizePeep, backgroundHidden, setBackgroundHidden} = usePeep()

  const handleShare = (name: string, traits: TraitData[]) => {
    const encoded = encodeTraitsToString(traits, name)
    const url = `${window.location.origin}${window.location.pathname}?peep=${encoded}${
      account.email ? `&fromEmail=${btoa(account.email)}` : ''
    }`
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert('Share URL copied to clipboard!')
      })
      .catch(() => {
        alert('Failed to copy URL. Your peep URL is:\n' + url)
      })
  }

  return (
    <div className="flex justify-between items-center mx-4 my-2">
      <h2 className="text-xl font-bold">{currentPeepName}</h2>
      <div className="flex gap-2">
        <Button onClick={() => openModal('saveLoad')} title="Save/Load Peep">
          <FontAwesomeIcon icon={faFloppyDisk} />
        </Button>
        <Button
          onClick={() => handleShare(currentPeepName || 'MyPeep', selectedTraits)}
          title="Share"
        >
          <FontAwesomeIcon icon={faShareNodes} />
        </Button>
        {account.isAdmin && (
          <>
            <Button onClick={randomizePeep} title="Randomize">
              <FontAwesomeIcon icon={faDice} />
            </Button>
            <DownloadButton svgRef={canvasRef} currentName={currentPeepName} />
          </>
        )}
        <Button onClick={() => setBackgroundHidden(!backgroundHidden)} title="Toggle Background">
          <FontAwesomeIcon icon={backgroundHidden ? faEye : faEyeSlash} />
        </Button>
      </div>
    </div>
  )
}
