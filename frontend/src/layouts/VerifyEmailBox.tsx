import {Button, Divider} from '@mui/material';
import {authApi} from '../utils/api';
import {assertIsError} from '../utils/error';
import {ErrorSchema, ResponseError} from '../openapi';
import {Message, MessageProps} from '../components/Message';
import {useState} from 'react';
import {SEC} from '../utils/time';
import Box from '../components/Box';
import './VerifyEmailBox.css';
import {useAuthContext} from '../hooks/useAuthContext';

const BUTTON_DELAY = 20 * SEC.IN_MS;
export function VerifyEmailBox() {
  const [messageProps, setMessageProps] = useState<MessageProps>({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const authContext = useAuthContext();
  async function onClickSendEmail() {
    if (isButtonDisabled) {
      return;
    }
    try {
      try {
        setIsButtonDisabled(true);
        setMessageProps({
          type: 'info',
          message: 'Sending...',
        });

        if (!authContext.authStatus) {
          throw new Error('Auth status is not set');
        }
        await authApi.sendVerificationEmail({
          xCsrfToken: authContext.authStatus.csrfToken,
        });
        setMessageProps({
          type: 'success',
          message:
            'A new verification email has been sent. Please check your email.',
        });
      } catch (error) {
        assertIsError(error);
        let message: string = error.message;
        if (error instanceof ResponseError) {
          const data = (await error.response.json()) as ErrorSchema;
          message = data.message || error.response.statusText;
        }
        setMessageProps({
          type: 'error',
          message: `Failed to send a new verification email. ${message}`,
        });
      }
    } catch (error) {
      setMessageProps({
        type: 'error',
        message:
          'Failed to send a new verification email. Unexpected error occurred. Please try again later.',
      });
    }
    await delay(BUTTON_DELAY);
    setIsButtonDisabled(false);
  }
  return (
    <Box className="verify-email-box">
      <h1>Please Verify Your Email</h1>
      <div>
        <p>Please check your email and click the verification link.</p>
        <Divider flexItem />
        <p>
          You can also request a new verification email by clicking the button
          below.
        </p>
        <Message {...messageProps} />
        <Button
          variant="contained"
          color="primary"
          onClick={onClickSendEmail}
          disabled={isButtonDisabled}
        >
          Request a new verification email
        </Button>
        {isButtonDisabled ? (
          <div>Please wait a moment before trying again.</div>
        ) : null}
      </div>
    </Box>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
