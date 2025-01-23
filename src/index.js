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
import { SpeedInsights } from "@vercel/speed-insights/react";
import Tache from './pages/Tache';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashemployee" element={<DashEmployee />} />
        <Route path="/dashresponsable" element={<DashResponsable />} />
        <Route path="/AjouteTache" element={<AjouteTache />} />
        <Route path="/Tache" element={<Tache />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);