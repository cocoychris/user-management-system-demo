import {useState} from 'react';
import Box from '../components/Box';
import SignUpForm from '../layouts/SignUpForm';
import './SignUpPage.css';
import {Navigate} from 'react-router-dom';
import {Link} from 'react-router-dom';

const LOGIN_ROUTE = '/login';
export default function SignUpPage() {
  document.title = 'Sign Up | UMS';
  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
  function onSubmitSuccess() {
    setIsSignUpSuccess(true);
    // Return true to indicate that it is done and the form can be disabled.
    return true;
  }
  if (isSignUpSuccess) {
    return <Navigate to="/verify-email" />;
  }
  return (
    <Box className="sign-up-page">
      <h1>Sign Up</h1>
      <SignUpForm onSubmitSuccess={onSubmitSuccess} />
      <p hidden={isSignUpSuccess}>
        Already have an account? <Link to={LOGIN_ROUTE}>Login</Link>
      </p>
    </Box>
  );
}
