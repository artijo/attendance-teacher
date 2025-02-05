import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

// import pages
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

// Subject Page
import Subject from './pages/subject/Subject.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
      <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/" element={<App />} >
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='subjects' element={<Subject />} />

        </Route>
      </Routes>
  </BrowserRouter>,
  // </StrictMode>,
)
