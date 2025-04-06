import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import {AuthProvider} from './contexts/AuthContext'
import {CanvasProvider} from './contexts/CanvasContext'
import {ModalProvider} from './contexts/ModalContext'
import {PeepProvider} from './contexts/PeepContext'
import './index.css'
import reportWebVitals from './reportWebVitals'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <AuthProvider>
      <PeepProvider>
        <ModalProvider>
          <CanvasProvider>
            <App />
          </CanvasProvider>
        </ModalProvider>
      </PeepProvider>
    </AuthProvider>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
