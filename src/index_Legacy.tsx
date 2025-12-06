// DEPRECATED
// Please use src/index.tsx.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App_Legacy from './App_Legacy';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App_Legacy />);
}