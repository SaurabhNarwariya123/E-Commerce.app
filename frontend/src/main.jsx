
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import ShopContextProvider from './context/ShopContext.jsx'

// Polyfill for performance API to prevent clearMarks error
if (!window.performance) {
  window.performance = {}
}
if (!window.performance.clearMarks) {
  window.performance.clearMarks = () => {}
}
if (!window.performance.mark) {
  window.performance.mark = () => {}
}
if (!window.performance.measure) {
  window.performance.measure = () => {}
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ShopContextProvider>
       <App/>
    </ShopContextProvider>  
  </BrowserRouter>,
)
