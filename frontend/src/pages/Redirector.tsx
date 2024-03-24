import {Navigate, Outlet} from 'react-router-dom';
import {useAuthContext} from '../hooks/useAuthContext';

export default function Redirector({
  onAuthenticated: onAuthenticated,
  onUnauthenticated: onUnauthenticated,
}: {
  onAuthenticated?: string;
  onUnauthenticated?: string;
}) {
  const authContext = useAuthContext();
  if (onAuthenticated && authContext.authStatus?.isAuthenticated) {
    return <Navigate to={onAuthenticated} />;
  }
  if (onUnauthenticated && !authContext.authStatus?.isAuthenticated) {
    return <Navigate to={onUnauthenticated} />;
  }
  return <Outlet />;
}
