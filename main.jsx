import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'      // Introduce your application's main component.
import './index.css'             

//Find the `<div id="root">` in `index.html` and render `<App />` inside it.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
