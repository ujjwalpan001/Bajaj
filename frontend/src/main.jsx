import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// ReactFlow base styles (required for nodes/edges to render correctly)
import '@xyflow/react/dist/style.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
