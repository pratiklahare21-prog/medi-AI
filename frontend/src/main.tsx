import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthContextProvider } from './context/AuthContext';
import { GoogleOAuthWrapper } from './context/GoogleOAuthContext';
import './index.css';
import './i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthWrapper>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </GoogleOAuthWrapper>
  </StrictMode>,
);
