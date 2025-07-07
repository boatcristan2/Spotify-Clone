import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 MAIN.TSX - React app starting...');
console.log('🔍 MAIN.TSX - Current URL:', window.location.href);
console.log('🔍 MAIN.TSX - URL Search Params:', window.location.search);
console.log('🔍 MAIN.TSX - Has auth code:', new URLSearchParams(window.location.search).has('code'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)