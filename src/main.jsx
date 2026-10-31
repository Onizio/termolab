import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return <main style={{ padding: '2rem', fontFamily: 'Arial' }}><h1>TermoLab não conseguiu iniciar</h1><p>{this.state.error.message}</p><button onClick={() => window.location.reload()}>Recarregar</button></main>
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)