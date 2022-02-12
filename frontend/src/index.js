import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/tailwind-light/theme.css';
import 'primeflex/primeflex.css';

ReactDOM.render(
  <BrowserRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>,
  document.getElementById('root')
);
