import {Outlet} from 'react-router-dom';
import {Message, MessageProps} from '../components/Message';
import {useAuthContext} from '../hooks/useAuthContext';
import {useEffect, useState} from 'react';
import {assertIsError} from '../utils/error';
import './AuthLoadingPage.css';

export function AuthLoadingPage() {
  document.title = 'Loading | UMS';
  const [messageProps, setMessageProps] = useState<MessageProps>({
    type: 'info',
    message: 'Loading...',
  });
  const authContext = useAuthContext();

  useEffect(() => {
    if(authContext.authStatus){
      return;
    }
    authContext.fetchAuthStatus().catch(error => {
      assertIsError(error);
      setMessageProps({
        type: 'error',
        message: `Failed to get auth status. ${error.message}`,
      });
    });
    // Need this function to run only once, otherwise it will cause an infinite loop
    // eslint-disable-next-line
  }, [authContext.authStatus]);

  if (!authContext.authStatus) {
    return (
      <section className="index-page">
        <div className="container">
          <Message {...messageProps} />
        </div>
      </section>
    );
  }
  return <Outlet />;
}
