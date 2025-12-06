import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Inject Global Styles
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Roboto+Condensed:wght@400;700;900&display=swap');

  body {
    background-color: #111827;
    background-image: radial-gradient(#1f2937 1px, transparent 1px);
    background-size: 20px 20px;
    margin: 0;
    font-family: 'Roboto Condensed', sans-serif;
    -webkit-font-smoothing: antialiased;
    color: #fff;
  }

  /* Custom Scrollbar for Graphic Novel look */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #111827; 
  }
  ::-webkit-scrollbar-thumb {
    background: #39ff14; 
    border: 1px solid #000;
  }
`;
document.head.appendChild(style);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);