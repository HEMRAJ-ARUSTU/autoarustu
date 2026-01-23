import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AxiosCom from './Interceptors/axios.js'

AxiosCom();

createRoot(document.getElementById('root')).render(

    <App />

)