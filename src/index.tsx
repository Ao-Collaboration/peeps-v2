import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import {AuthProvider} from './providers/AuthProvider'
import {CanvasProvider} from './providers/CanvasProvider'
import {ModalProvider} from './providers/ModalProvider'
import {PeepProvider} from './providers/PeepProvider'
import {WalletProvider} from './providers/WalletProvider'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <AuthProvider>
      <PeepProvider>
        <WalletProvider>
          <ModalProvider>
            <CanvasProvider>
              <App />
            </CanvasProvider>
          </ModalProvider>
        </WalletProvider>
      </PeepProvider>
    </AuthProvider>
  </React.StrictMode>,
)
