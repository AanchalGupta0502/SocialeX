import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import { GeneralContextProvider } from './context/GeneralContextProvider';
import AuthenticationContextProvider from './context/AuthenticationContextProvider';
import { SocketContextProvider } from './context/SocketContextProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
      <AuthenticationContextProvider>
        <SocketContextProvider>
          <GeneralContextProvider>
              <App />
          </GeneralContextProvider>
        </SocketContextProvider>
      </AuthenticationContextProvider>
    </BrowserRouter>
);

