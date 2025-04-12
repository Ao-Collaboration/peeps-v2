import {
  faDice,
  faEye,
  faEyeSlash,
  faFloppyDisk,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {useAuth} from '../providers/contexts/AuthContext'
import {useCanvas} from '../providers/contexts/CanvasContext'
import {useModal} from '../providers/contexts/ModalContext'
import {usePeep} from '../providers/contexts/PeepContext'
import {PeepMetadata} from '../types/metadata'
import {encodePeepToString} from '../utils/traitUtils'
import Button from './Button'
import DownloadButton from './DownloadButton'

interface ButtonsBarProps {
  peep: PeepMetadata
}

export default function ButtonsBar({peep}: ButtonsBarProps) {
  const {account} = useAuth()
  const {canvasRef} = useCanvas()
  const {openModal} = useModal()
  const {randomizePeep, backgroundHidden, setBackgroundHidden} = usePeep()

  const handleShare = (peep: PeepMetadata) => {
    const encoded = encodePeepToString(peep)
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
      <h2 className="text-xl font-bold">{peep.name}</h2>
      <div className="flex gap-2">
        <Button onClick={() => openModal('saveLoad')} title="Save/Load Peep">
          <FontAwesomeIcon icon={faFloppyDisk} />
        </Button>
        <Button onClick={() => handleShare(peep)} title="Share">
          <FontAwesomeIcon icon={faShareNodes} />
        </Button>
        {account.isAdmin && (
          <>
            <Button onClick={randomizePeep} title="Randomize">
              <FontAwesomeIcon icon={faDice} />
            </Button>
            <DownloadButton svgRef={canvasRef} currentName={peep.name} />
          </>
        )}
        <Button onClick={() => setBackgroundHidden(!backgroundHidden)} title="Toggle Background">
          <FontAwesomeIcon icon={backgroundHidden ? faEye : faEyeSlash} />
        </Button>
      </div>
    </div>
  )
}
