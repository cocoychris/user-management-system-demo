import {Button, Divider} from '@mui/material';
import Box from '../components/Box';
import LoginForm from '../layouts/LoginForm';
import GoogleLogo from '../assets/google_g_logo.svg';
import './LoginPage.css';
import {useState} from 'react';
import {Link} from 'react-router-dom';

const GOOGLE_LOGIN_URL = '/api/v1/auth/google';
const SIGNUP_ROUTE = '/signup';

export function LoginPage() {
  document.title = 'Login | UMS';
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  function onSubmitSuccess() {
    setIsLoginSuccess(true);
    return true;
  }

  function onClickedGoogleLogin() {
    window.location.href = GOOGLE_LOGIN_URL;
  }
  return (
    <>
      <p>
        <Link className="about-link" to="/about">
          Where is this place? 🙄
        </Link>
      </p>
      <Box className="login-page">
        <h1>Login</h1>
        <LoginForm onSubmitSuccess={onSubmitSuccess} />
        <Divider flexItem>Or</Divider>
        <Button
          variant="contained"
          color="primary"
          type="button"
          onClick={onClickedGoogleLogin}
          disabled={isLoginSuccess}
        >
          <img className="google-g-logo" src={GoogleLogo} alt="Google Logo" />
          Login with Google
        </Button>
        <p hidden={isLoginSuccess}>
          Don't have an account? <Link to={SIGNUP_ROUTE}>Sign up</Link>
        </p>
      </Box>
    </>
  );
}
