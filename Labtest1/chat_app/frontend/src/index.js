// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // You can use this for global CSS if needed
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <App />
  </Router>
);
