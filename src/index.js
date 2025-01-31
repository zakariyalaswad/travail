import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashEmployee from './pages/dashEmployee';
import DashResponsable from './pages/dashResponsable';
import AjouteTache from './pages/AjouteTache';
import Chat from './pages/chat';
import Employer from './pages/employee';
import Profil from './pages/profil';
import Error from './pages/ERROR';
import AuthGuard from './components/AuthGuard';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashemployee" element={
          <AuthGuard allowedRoles={['employee']}>
            <DashEmployee />
          </AuthGuard>
        } />
        <Route path="/dashResponsable" element={
          <AuthGuard allowedRoles={['responsable']}>
            <DashResponsable />
          </AuthGuard>
        } />
        <Route path="/AjouteTache" element={
          <AuthGuard allowedRoles={['responsable']}>
            <AjouteTache />
          </AuthGuard>
        } />
        <Route path="/employee" element={
          <AuthGuard allowedRoles={['responsable']}>
            <Employer />
          </AuthGuard>
        } />
        <Route path="/chat" element={
          <AuthGuard allowedRoles={['employee', 'responsable']}>
            <Chat />
          </AuthGuard>
        } />
        <Route path='/profil' element={
          <AuthGuard allowedRoles={['employee', 'responsable']}>
            <Profil/>
          </AuthGuard>
        }/>
        <Route path='/ERROR' element={<Error/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);