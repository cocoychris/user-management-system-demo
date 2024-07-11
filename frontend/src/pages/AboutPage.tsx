import React from 'react';
import Box from '../components/Box';
import './AboutPage.css';
import {Button} from '@mui/material';
import {Link} from 'react-router-dom';

function AboutPage() {
  return (
    <Box className="about-page">
      <h1>Where Is This Place? 🤔</h1>
      <p>
        Hi, I'm <a href="https://andrash.dev/page/about_andrash">Andrash</a>,
        the creator of this site. It's designed to showcase my full-stack web
        development skills, with a focus on backend development. The frontend is
        intentionally simple.
      </p>
      <p>
        For details on the backend and frontend implementation, visit my{' '}
        <a
          href="https://github.com/cocoychris/user-management-system-demo"
          target="_blank"
        >
          GitHub repository
        </a>
        . Additionally, explore the{' '}
        <a href="http://localhost:5173/docs/swagger" target="_blank">
          Swagger documentation
        </a>{' '}
        to see the API design and its comprehensive documentation.
      </p>
      <h2>Basic Features</h2>
      <p>
        This site offers a user management system with the following features:
      </p>
      <ol>
        <li>
          User <Link to="/signup">Sign-Up</Link> and{' '}
          <Link to="/login">Login</Link> via Email (Please try it out)
        </li>
        <li>
          User Sign-Up and Login <Link to="/login">via Google Account</Link>{' '}
          with OAuth2 (Please try this too)
        </li>
        <li>
          Field value validation (e.g., email format, password length, etc.) on
          both the frontend and backend
        </li>
        <li>Email Verification - Receive an email after signing up</li>
        <li>
          Password Reset - Available only for users who signed up with email.
          (Google account users cannot reset their password.)
        </li>
        <li>User Profile Update - Modify your username</li>
        <li>
          Access User Statistics (Weekly Active Users, Total Users, etc.) after
          logging in
        </li>
        <li>View User List and Details after logging in</li>
      </ol>
      <h2>Security Features</h2>
      <p>
        The following security features are implemented on the backend side:
      </p>
      <ol>
        <li>
          Enhanced CSRF Protection: Implemented double CSRF protection for added
          security.
        </li>
        <li>
          Secure Session Management: Sessions are stored in secure, HTTP-only
          cookies.
        </li>
        <li>
          Secure Password Storage: Passwords are securely hashed using bcrypt
          before storage in our database.
        </li>
        <li>
          Rate Limiting: Excessive requests from the same IP address will
          trigger a temporary ban to prevent abuse.
        </li>
        <li>
          Time-Limited Tokens: Email verification links are designed to expire
          after a specified duration for security purposes.
        </li>
      </ol>
      <Link to="/">
        <Button variant="contained" color="primary" type="button">
          Go Back
        </Button>
      </Link>
    </Box>
  );
}

export default AboutPage;
