/**
 * @fileoverview
 * This file contains the controller for the authentication routes.
 *
 * Controllers are the end point middleware of a route.
 * It implements the main business logic of the route,
 * and is responsible for sending the response.
 * @module
 */

import {Request, Response, NextFunction} from 'express';
import passport from 'passport';
import {env} from '../globalVars';
import {SelectUser} from '../models/userModel';
import {TokenPurpose, SelectToken} from '../models/tokenModel';
import {VerifyEmailRequest, verifyEmailReqSchema} from '../schemas/authSchema';
import {
  createToken,
  deleteTokensBy,
  validateToken,
} from '../services/tokenService';
import {sendVerificationEmail, setEmailVerified} from '../services/authService';
import {appLogger} from '../utils/logger';
import {toUserProfile, updateLastActive} from '../services/userService';
import {assertIsError, zodErrorToMessage} from '../utils/error';
import {ZodError} from 'zod';
import {asyncCatch} from '../middleware';
import {HttpError} from '../utils/HttpError';
import {generateToken} from '../utils/csrf';

const logger = appLogger.child({module: 'authController'});
/**
 * The endpoint to check the authentication status of the user.
 * @openapi
 * components:
 *   responses:
 *     CheckStatusResponse:
 *       description: Responds with the authentication status of the user.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAuthenticated:
 *                 type: boolean
 *                 description: Whether the user is authenticated.
 *               isEmailVerified:
 *                 type: boolean
 *                 description: Whether the user's email is verified.
 *               authStrategy:
 *                 type: string
 *                 description: The authentication strategy used to authenticate the user. Only provided if the user is authenticated.
 *                 example: 'local'
 *               csrfToken:
 *                 type: string
 *                 description: The CSRF token for the user session. Only provided if the user is authenticated.
 *                 example: '96a87aac7682fa382d86d81afeb87e9fc32d457bc5f8bb2b9c3e3f547bc20b90b8bb7d5fd9a3a97b3323a79a06d3cf169a8a25449935dd71750dc4722a0f4b77'
 *             required:
 *               - isAuthenticated
 *               - isEmailVerified
 */
export const checkStatusReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    const isAuthenticated = req.isAuthenticated();
    res.status(200).json({
      isAuthenticated,
      isEmailVerified: isAuthenticated ? req.user.isEmailVerified : false,
      authStrategy: isAuthenticated ? req.user.authStrategy : undefined,
      csrfToken: isAuthenticated ? generateToken(req, res) : undefined,
    });
  }
);
/**
 * The endpoint to authenticate the user using the local strategy (email and password).
 * @openapi
 * components:
 *   responses:
 *     LoginResponse:
 *       description: Responds with the user profile of the authenticated user.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAuthenticated:
 *                 type: boolean
 *                 description: Always true if the user is authenticated.
 *                 example: true
 *               isEmailVerified:
 *                 type: boolean
 *                 description: Whether the user's email is verified.
 *               authStrategy:
 *                 type: string
 *                 description: The authentication strategy used to authenticate the user.
 *                 example: 'local'
 *               csrfToken:
 *                 type: string
 *                 description: The CSRF token for the user session.
 *                 example: '96a87aac7682fa382d86d81afeb87e9fc32d457bc5f8bb2b9c3e3f547bc20b90b8bb7d5fd9a3a97b3323a79a06d3cf169a8a25449935dd71750dc4722a0f4b77'
 *               userProfile:
 *                 $ref: '#/components/schemas/UserProfile'
 *             required:
 *               - isAuthenticated
 *               - isEmailVerified
 *               - authStrategy
 *               - csrfToken
 *               - userProfile
 *     Login401Response:
 *       description: Unauthorized. User login failed.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 */
export function loginReqHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const onAuthenticated = (
    error: Error,
    user: SelectUser,
    info: {message: string}
  ) => {
    // Error during authentication.
    if (error) {
      next(error); // Error 500
      return;
    }
    // Not authenticated.
    if (!user) {
      res.status(401).json({message: info.message});
      return;
    }
    // User is authenticated.
    req.logIn(user, async (error: Error) => {
      if (error) {
        next(error); // Error 500
        return;
      }
      try {
        const updatedUser: SelectUser = await updateLastActive(user.id, true);
        res.status(200).json({
          isAuthenticated: true,
          isEmailVerified: updatedUser.isEmailVerified,
          authStrategy: user.authStrategy,
          csrfToken: generateToken(req, res),
          userProfile: toUserProfile(updatedUser),
        });
        return;
      } catch (error) {
        next(error); // Error 500
        return;
      }
    });
  };
  passport.authenticate('local', onAuthenticated)(req, res, next);
}
/**
 * The endpoint to log out the user.
 * @openapi
 * components:
 *   responses:
 *     LogoutResponse:
 *       description: Responds with a message to inform the user that the logout was successful.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Logout successful
 *                 example: 'Logout successful'
 *             required:
 *               - message
 */
export function logoutReqHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.logout((error: Error) => {
    if (error) {
      next(error); // Error 500
    }
    res.status(200).json({message: 'Logout successful'});
  });
}
/**
 * Endpoint to verify the user's email.
 * @openapi
 * components:
 *   responses:
 *     VerifyEmail302Response:
 *       description: Redirects the user to the dashboard if the email verification is successful.
 *       headers:
 *         Location:
 *           description: The URL of the dashboard.
 *           schema:
 *             type: string
 *     VerifyEmail400HtmlResponse:
 *       description: Responds with a webpage to inform the user that the email verification failed. Also contains a link to the login page.
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *             example: '<!DOCTYPE html> ...'
 */
export const verifyEmailReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    let verifyEmailRequest: VerifyEmailRequest;
    const loginUrl = `${env.FRONTEND_URL}/login`;
    try {
      verifyEmailRequest = verifyEmailReqSchema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      });
    } catch (error) {
      assertIsError(error, ZodError);
      const zodErrormessage = zodErrorToMessage(error);
      logger.warn(
        `Bad Request: The request does not match the schema.\n${zodErrormessage}`
      );
      res.status(400).render('message', {
        type: 'error',
        title: 'Error 400: Bad Request',
        summary:
          'Your email verification link might be broken. Please request a new email verification link after logging in.',
        details: `The request does not match the schema. ${zodErrormessage}`,
        buttonText: 'Go to Login Page',
        buttonUrl: loginUrl,
      });
      return;
    }
    const token = verifyEmailRequest.params.token;
    const tokenRecord: SelectToken | null = await validateToken(
      token,
      TokenPurpose.VERIFY_EMAIL
    );
    if (!tokenRecord) {
      logger.warn(`Attempt to use invalid email verification token: ${token}`);
      res.status(400).render('message', {
        type: 'error',
        title: 'Error 400: Bad Request',
        summary:
          'Your email verification link might be expired. Please request a new email verification link after logging in.',
        details: null,
        buttonText: 'Go to Login Page',
        buttonUrl: loginUrl,
      });
      return;
    }
    await setEmailVerified(tokenRecord);
    res.status(302).redirect(`${env.FRONTEND_URL}/dashboard`);
  }
);
/**
 * Endpoint to create a new email verification token and send the verification email to the user.
 * Note that old tokens with the same purpose will be deleted.
 * @openapi
 * components:
 *   responses:
 *     SendVerificationEmailResponse:
 *       description: Creates a new email verification token and sends the verification email to the user. Responds with the token expiration time. Note that old tokens with the same purpose will be deleted.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenExpireDateTime:
 *                 type: string
 *                 description: The token expiration time in ISO 8601 format.
 *                 example: '2024-03-15T13:11:33.957Z'
 *             required:
 *               - tokenExpireDateTime
 */
export const sendVerificationEmailReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    const user = req.user as SelectUser;
    await deleteTokensBy(user.id, TokenPurpose.VERIFY_EMAIL);
    const tokenRecord: SelectToken = await createToken({
      userId: user.id,
      purpose: TokenPurpose.VERIFY_EMAIL,
      ttlSec: env.VERIFY_EMAIL_TOKEN_TTL_SEC,
    });
    await sendVerificationEmail(user, tokenRecord);
    res.status(200).json({
      tokenExpireDateTime: tokenRecord.expire,
    });
  }
);
/**
 * Endpoint to authenticate the user using the Google OAuth strategy.
 * @openapi
 * components:
 *   responses:
 *     GoogleAuth302Response:
 *       description: Redirects the user to the Google OAuth consent screen.
 *       headers:
 *         Location:
 *           description: The URL of the Google OAuth consent screen.
 *           schema:
 *             type: string
 *             example: 'https://accounts.google.com/o/oauth2/v2/auth?...'
 *     GoogleAuth403HtmlResponse:
 *       description: Responds with a webpage to inform the user that they are already logged in. Also contains a link to the dashboard.
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *             example: '<!DOCTYPE html> ...'
 */
export const googleAuthReqHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    res.status(403).render('message', {
      type: 'error',
      title: 'Error 403: Forbidden',
      summary:
        'You are already logged in. Please log out before signing up using Google.',
      details: null,
      buttonText: 'Go to Dashboard',
      buttonUrl: `${env.FRONTEND_URL}/dashboard`,
    });
    return;
  }
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    prompt: 'select_account', // Instead of logging the user in directly, prompt them to select an account in case the account they have selected fails to validate.
  })(req, res, next);
};
/**
 * Endpoint to handle the callback from the Google OAuth strategy.
 * @openapi
 * components:
 *   responses:
 *     GoogleAuthCallback302Response:
 *       description: Redirects the user to the dashboard if the authentication is successful.
 *       headers:
 *         Location:
 *           description: The URL of the dashboard.
 *           schema:
 *             type: string
 *     GoogleAuthCallback403HtmlResponse:
 *       description: Responds with a webpage to inform the user that they are already logged in. Also contains a link to the dashboard.
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *             example: '<!DOCTYPE html> ...'
 *     GoogleAuthCallback400HtmlResponse:
 *       description: Responds with a webpage to inform the user that the Google authentication failed. Also contains a link to the login page. This may happen when the required data cannot be found in the Google profile.
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *             example: '<!DOCTYPE html> ...'
 *     GoogleAuthCallback409HtmlResponse:
 *      description: Responds with a webpage to inform the user that the Google authentication failed. Also contains a link to the login page. This may happen when the user is already signed up with the same email using a different method.
 *      content:
 *        text/html:
 *          schema:
 *            type: string
 *            example: '<!DOCTYPE html> ...'
 */
export const googleAuthCallbackReqHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    res.status(403).render('message', {
      type: 'error',
      title: 'Error 403: Forbidden',
      summary:
        'You are already logged in. Please log out before signing up using Google.',
      details: null,
      buttonText: 'Go to Dashboard',
      buttonUrl: `${env.FRONTEND_URL}/dashboard`,
    });
    return;
  }
  const onAuthenticated = (error: Error, user: SelectUser) => {
    // Handle 4xx HTTP errors.
    if (error instanceof HttpError) {
      res.status(error.status).render('message', {
        type: 'error',
        title: `Error ${error.status}`,
        summary: error.message,
        details: null,
        buttonText: 'Go to Login Page',
        buttonUrl: `${env.FRONTEND_URL}/login`,
      });
      return;
    }
    // Handle 500 HTTP errors.
    if (error) {
      next(error);
      return;
    }
    // Successful authentication.
    req.logIn(user, async (error: Error) => {
      // Handle login errors.
      if (error) {
        next(error); // Error 500
        return;
      }
      // Successful login.
      await updateLastActive(user.id, true);
      res.status(302).redirect(`${env.FRONTEND_URL}/dashboard`);
    });
  };
  passport.authenticate('google', onAuthenticated)(req, res, next);
};
