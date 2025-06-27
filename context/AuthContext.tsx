import { StreamVideoClient, User } from '@stream-io/video-react-native-sdk';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthProps {
  authState: {
    token: string | null;
    authenticated: boolean | null;
    user_id: string | null;
  };
  client: StreamVideoClient | null;
  onRegister: (email: string, password: string) => Promise<any>;
  onLogin: (email: string, password: string) => Promise<any>;
  onLogout: () => Promise<any>;
  initialized: boolean;
}

const TOKEN_KEY = 'my-token';
export const API_URL = 'https://auth-api-stream-production-1613.up.railway.app';
const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_ACCESS_KEY;
const AuthContext = createContext<Partial<AuthProps>>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
    user_id: string | null;
  }>({
    token: null,
    authenticated: null,
    user_id: null,
  });
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const data = await SecureStore.getItemAsync(TOKEN_KEY);
        if (data) {
          const { token, user } = JSON.parse(data);
          console.log('Loaded token from SecureStore:', { token, user });
          setAuthState({
            token,
            authenticated: true,
            user_id: user.id,
          });

          if (token && user.id && STREAM_KEY) {
            const userData: User = { id: user.id };
            const streamClient = new StreamVideoClient({
              apiKey: STREAM_KEY,
              user: userData,
              token,
            });
            setClient(streamClient);
            console.log('StreamVideoClient initialized on startup:', user.id);
          } else {
            console.warn('Missing token, user.id, or STREAM_KEY:', { token, userId: user?.id, hasStreamKey: !!STREAM_KEY });
          }
        } else {
          console.log('No token found in SecureStore');
        }
      } catch (e) {
        console.error('Error loading token from SecureStore:', e);
      }
      setInitialized(true);
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (authState.authenticated && authState.token && authState.user_id && STREAM_KEY && !client) {
      const user: User = { id: authState.user_id };
      try {
        console.log('Initializing StreamVideoClient with:', {
          apiKey: STREAM_KEY,
          user,
          token: authState.token,
        });
        const streamClient = new StreamVideoClient({
          apiKey: STREAM_KEY,
          user,
          token: authState.token,
        });
        setClient(streamClient);
      } catch (e) {
        console.error('Error creating StreamVideoClient:', e);
      }
    }
  }, [authState, client]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email });
      const result = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!result.ok) {
        const error = await result.json();
        console.error('Login failed:', error);
        return { error: true, msg: error.message || 'Login failed' };
      }

      const json = await result.json();
      console.log('Login response:', json);
      setAuthState({
        token: json.token,
        authenticated: true,
        user_id: json.user.id,
      });

      await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(json));
      console.log('Token saved to SecureStore:', json);
      return json;
    } catch (e) {
      console.error('Login error:', e);
      return { error: true, msg: 'An error occurred during login' };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      console.log('Attempting register with:', { email });
      const result = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!result.ok) {
        const error = await result.json();
        console.error('Register failed:', error);
        return { error: true, msg: error.message || 'Registration failed' };
      }

      const json = await result.json();
      console.log('Register response:', json);

      setAuthState({
        token: json.token,
        authenticated: true,
        user_id: json.user.id,
      });

      await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(json));
      console.log('Token saved to SecureStore:', json);
      return json;
    } catch (e) {
      console.error('Register error:', e);
      return { error: true, msg: 'An error occurred during registration' };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      if (client) {
        await client.disconnectUser();
        console.log('StreamVideoClient disconnected');
      }
      setAuthState({
        token: null,
        authenticated: false,
        user_id: null,
      });
      setClient(null);
      console.log('Logged out successfully');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState,
    client,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};