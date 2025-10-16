import { createRoot } from 'react-dom/client'
import './index.css'

// Direct Connection. Works both locally and in recall.ai
// import App from './direct/App.tsx'

// Using @pipecat-ai/small-webrtc-transport. Works locally but NOT in recall.ai
import App from './pipecat-library/App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)
