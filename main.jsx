import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'      // 引入你的应用主组件
import './index.css'             // 引入全局样式

// 找到 index.html 里的 <div id="root">，把 <App /> 渲染进去
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
