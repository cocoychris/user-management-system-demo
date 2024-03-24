import {useContext} from 'react';
import {AuthContext, AuthContextValue} from '../contexts/AuthContext';

export function useAuthContext(): AuthContextValue {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext value should not be null');
  }
  return authContext;
}
