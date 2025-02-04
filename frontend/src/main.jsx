import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { tfService } from './services/tfService';

// Initialize TensorFlow before rendering
async function initializeApp() {
  try {
    await tfService.initialize();
    
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Failed to initialize TensorFlow:', error);
    // Show a user-friendly error message
    document.getElementById('root').innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2>Application Error</h2>
        <p>Failed to initialize required components. Please refresh the page or try again later.</p>
      </div>
    `;
  }
}

initializeApp();