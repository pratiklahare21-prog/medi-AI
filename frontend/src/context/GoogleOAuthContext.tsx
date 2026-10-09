import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleOAuthContextType {
  isReady: boolean;
  clientId: string;
}

const GoogleOAuthContext = createContext<GoogleOAuthContextType>({
  isReady: false,
  clientId: '',
});

export const useGoogleOAuth = () => useContext(GoogleOAuthContext);

interface GoogleOAuthWrapperProps {
  children: React.ReactNode;
}

export const GoogleOAuthWrapper: React.FC<GoogleOAuthWrapperProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (clientId && clientId !== 'your-google-client-id.apps.googleusercontent.com') {
      setIsReady(true);
    }
  }, [clientId]);

  if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
    // OAuth not configured, render children without OAuth provider
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleOAuthContext.Provider value={{ isReady, clientId }}>
        {children}
      </GoogleOAuthContext.Provider>
    </GoogleOAuthProvider>
  );
};
