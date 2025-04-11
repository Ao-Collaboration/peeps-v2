import {useState} from 'react'

import {faDiscord, faXTwitter} from '@fortawesome/free-brands-svg-icons'
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

const Footer = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-4 flex justify-between items-center text-gray-600 hover:bg-gray-50"
      >
        <span className="text-sm font-medium">About Peeps</span>
        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
      </button>

      {isExpanded && (
        <div className="px-4 py-3 text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">About Us</h3>
              <p className="mb-4">
                Peeps is created by{' '}
                <a
                  href="https://aocollab.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint-500 hover:text-mint-dark"
                >
                  Ao Collaboration Ltd
                </a>
                .
              </p>
              <div className="flex gap-4">
                <a
                  href="https://peeps.club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint-500 hover:text-mint-dark"
                >
                  Visit Main Site
                </a>
                <a
                  href="https://peeps.club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint-500 hover:text-mint-dark"
                >
                  Visit Shop
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Legal</h3>
              <div className="space-y-2">
                <a
                  href="https://peeps.club/terms-and-conditions"
                  className="block text-mint-500 hover:text-mint-dark"
                >
                  Terms & Conditions
                </a>
                <a
                  href="https://aocollab.tech/privacypolicy"
                  className="block text-mint-500 hover:text-mint-dark"
                >
                  Privacy Policy
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Social</h3>
              <div className="space-y-2">
                <div className="flex gap-4 mt-2">
                  <a
                    href="https://twitter.com/peeps_club"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mint-500 hover:text-mint-dark"
                  >
                    <FontAwesomeIcon icon={faXTwitter} />
                  </a>
                  <a
                    href="http://discord.gg/MFWHjMzfqR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mint-500 hover:text-mint-dark"
                  >
                    <FontAwesomeIcon icon={faDiscord} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Footer
