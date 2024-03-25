import {useState} from 'react';
import {createContext} from 'react';
import {authApi, userApi} from '../utils/api';
import {ErrorSchema, ResponseError, UserProfile} from '../openapi';
import {assertIsError} from '../utils/error';

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  authStrategy?: string;
  csrfToken: string;
}

export interface AuthContextValue {
  authStatus: AuthStatus | null;
  userProfile: UserProfile | null;
  setAuthStatus: (authStatus: AuthStatus | null) => void;
  setUserProfile: (userProfile: UserProfile) => void;
  fetchAuthStatus: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: AuthProviderProps) {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  async function fetchAuthStatus() {
    try {
      const data = await authApi.checkAuthStatus();
      setAuthStatus({
        isAuthenticated: data.isAuthenticated,
        isEmailVerified: data.isEmailVerified,
        authStrategy: data.authStrategy,
        csrfToken: data.csrfToken || '',
      });
    } catch (error) {
      assertIsError(error, ResponseError);
      const data = (await error.response.json()) as ErrorSchema;
      throw new Error(data.message || error.response.statusText);
    }
  }
  async function fetchUserProfile() {
    try {
      const data = await userApi.getMyProfile();
      setUserProfile(data.userProfile);
    } catch (error) {
      assertIsError(error, ResponseError);
      const data = (await error.response.json()) as ErrorSchema;
      throw new Error(data.message || error.response.statusText);
    }
  }
  return (
    <AuthContext.Provider
      value={{
        authStatus,
        userProfile,
        setAuthStatus,
        setUserProfile,
        fetchAuthStatus,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
