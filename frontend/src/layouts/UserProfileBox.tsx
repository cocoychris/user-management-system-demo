import {Button, Divider} from '@mui/material';
import {useAuthContext} from '../hooks/useAuthContext';
import {Message, MessageProps} from '../components/Message';
import {useEffect, useRef, useState} from 'react';
import {authApi} from '../utils/api';
import Box from '../components/Box';
import {ErrorSchema, ResponseError, UserProfile} from '../openapi';
import {assertIsError} from '../utils/error';
import './UserProfileBox.css';
import EditProfileForm from './EditProfileForm';
import ResetPasswordForm from './ResetPasswordForm';
import {SEC} from '../utils/time';
import GoogleLogo from '../assets/google_g_logo.svg';

const MESSAGE_DURATION = 5 * SEC.IN_MS;

export function UserProfileBox() {
  const messageTimer = useRef<NodeJS.Timeout | null>(null);
  const authContext = useAuthContext();
  const [messageProps, _setMessageProps] = useState<MessageProps>({});
  const [currentForm, setCurrentForm] = useState<
    'editProfile' | 'resetPassword' | null
  >(null);
  const isLocalAuthStrategy = authContext.authStatus?.authStrategy === 'local';
  const isGoogleAuthStrategy =
    authContext.authStatus?.authStrategy === 'googleOAuth';
  function setMessageProps(props: MessageProps) {
    _setMessageProps(props);
    if (props.message && MESSAGE_DURATION) {
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
      messageTimer.current = setTimeout(() => {
        _setMessageProps({});
      }, MESSAGE_DURATION);
    }
  }
  useEffect(() => {
    if (authContext.userProfile) {
      return;
    }
    setMessageProps({type: 'info', message: 'Loading user profile...'});
    authContext
      .fetchUserProfile()
      .then(() => {
        setMessageProps({});
      })
      .catch(error => {
        assertIsError(error);
        setMessageProps({
          type: 'error',
          message: `Failed to get user profile. ${error.message}`,
        });
      });
  }, [authContext]);

  async function onCLickLogOut() {
    setMessageProps({type: 'info', message: 'Logging out...'});
    try {
      if (!authContext.authStatus) {
        throw new Error('Auth status is not set');
      }
      await authApi.logout({
        xCsrfToken: authContext.authStatus.csrfToken,
      });
      authContext.setAuthStatus(null);
      setMessageProps({
        type: 'success',
        message: 'Logged out successfully',
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
        message: `Failed to log out. ${message}`,
      });
    }
  }
  function onCLickEditProfile() {
    setMessageProps({});
    setCurrentForm('editProfile');
  }
  function onClickResetPassword() {
    setMessageProps({});
    setCurrentForm('resetPassword');
  }
  async function onEditProfileSuccess(userProfile: UserProfile) {
    authContext.setUserProfile(userProfile);
    setCurrentForm(null);
    setMessageProps({
      type: 'success',
      message: 'Profile updated successfully',
    });
  }
  function onResetPasswordSuccess() {
    setMessageProps({
      type: 'success',
      message: 'Password updated successfully',
    });
    setCurrentForm(null);
  }
  function onCanceled() {
    setCurrentForm(null);
  }
  if (!authContext.userProfile) {
    return (
      <Box className="user-profile-box" direction="column">
        <Message {...messageProps} />
      </Box>
    );
  }
  return (
    <Box className="user-profile-box" direction="column">
      <Message {...messageProps} />
      <div className="user-profile-container">
        <div className="user-profile">
          <h2>
            {isGoogleAuthStrategy ? (
              <img
                className="google-g-logo"
                src={GoogleLogo}
                alt="Google Logo"
              />
            ):"👤 "}
            {authContext.userProfile.name}
          </h2>
          <span className="email">{authContext.userProfile.email}</span>
        </div>
        <Divider flexItem orientation="vertical" />
        <div className="button-group">
          <Button variant="contained" color="primary" onClick={onCLickLogOut}>
            Log out
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onCLickEditProfile}
            disabled={currentForm === 'editProfile'}
          >
            Edit Profile
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onClickResetPassword}
            disabled={currentForm === 'resetPassword' || !isLocalAuthStrategy}
          >
            {!isLocalAuthStrategy && '🚫 '}Reset Password
          </Button>
        </div>
      </div>
      {currentForm === 'editProfile' && (
        <EditProfileForm
          onSubmitSuccess={onEditProfileSuccess}
          onCanceled={onCanceled}
        />
      )}
      {currentForm === 'resetPassword' && (
        <ResetPasswordForm
          onSubmitSuccess={onResetPasswordSuccess}
          onCanceled={onCanceled}
        />
      )}
    </Box>
  );
}
