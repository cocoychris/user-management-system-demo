import {Button, Divider} from '@mui/material';
import {useAuthContext} from '../hooks/useAuthContext';
import {Message, MessageProps} from '../components/Message';
import {useEffect, useState} from 'react';
import {authApi} from '../utils/api';
import Box from '../components/Box';
import {ErrorSchema, ResponseError, UserProfile} from '../openapi';
import {assertIsError} from '../utils/error';
import './UserProfileBox.css';
import EditProfileForm from './EditProfileForm';
import ResetPasswordForm from './ResetPasswordForm';

export function UserProfileBox() {
  const authContext = useAuthContext();
  const [messageProps, setMessageProps] = useState<MessageProps>({});
  const [currentForm, setCurrentForm] = useState<
    'editProfile' | 'resetPassword' | null
  >(null);
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
      await authApi.logout();
      authContext.setAuthStatus({
        isAuthenticated: false,
        isEmailVerified: false,
      });
      setMessageProps({
        type: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      assertIsError(error, ResponseError);
      const data = (await error.response.json()) as ErrorSchema;
      setMessageProps({
        type: 'error',
        message: `Failed to log out. ${data.message || error.message}`,
      });
    }
  }
  function onCLickEditProfile() {
    setCurrentForm('editProfile');
  }
  function onClickResetPassword() {
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
          <h2>{authContext.userProfile.name}</h2>
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
            disabled={currentForm === 'resetPassword'}
          >
            Reset Password
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
