import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/sofia-sans';
import '@fontsource-variable/sofia-sans-condensed';
import '@fontsource-variable/sofia-sans-semi-condensed';
import './sistema/tokens.css';
import './sistema/base.css';
import './sistema/componentes.css';
import './sistema/graficos/graficos.css';
import App from './App.jsx';
import { ConOpciones } from './opciones.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConOpciones><App /></ConOpciones>
  </React.StrictMode>,
);
