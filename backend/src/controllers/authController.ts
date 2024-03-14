/**
 * Controller for the authentication routes.
 */
import {Request, Response, NextFunction} from 'express';
import passport from 'passport';
import {CLIENT_URL, env} from '../globalVars';
import {SelectUser} from '../models/userModel';
import {TokenPurpose} from '../models/authModel';
import {VerifyEmailRequest, verifyEmailReqSchema} from '../schema/authSchema';
import {SelectToken} from '../models/authModel';
import {createToken, validateToken} from '../services/tokenService';
import {sendVerificationEmail, setEmailVerified} from '../services/authService';
import {appLogger} from '../utils/logger';
import {updateLastActive} from '../services/userService';
import {assertIsError, zodErrorToMessage} from '../utils/error';
import {ZodError} from 'zod';
import {asyncCatch} from '../middleware';

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
 *               isEmailVerified:
 *                 type: boolean
 *                 description: Whether the user's email is verified.
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
  const callback = (
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
          isEmailVerified: updatedUser.isEmailVerified,
        });
        return;
      } catch (error) {
        next(error); // Error 500
        return;
      }
    });
  };
  passport.authenticate('local', callback)(req, res, next);
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
 *     VerifyEmailHtmlResponse:
 *       description: Responds with a webpage to inform the user whether the email is verified. Also contains a link to the login page.
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *     VerifyEmail400HtmlResponse:
 *       description: Responds with a webpage to inform the user that the email verification failed. Also contains a link to the login page.
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 */
export const verifyEmailReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    let verifyEmailRequest: VerifyEmailRequest;
    const loginUrl = `${CLIENT_URL}/login`;
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
    await setEmailVerified(tokenRecord); // If fail => Error 500
    res.status(200).render('message', {
      type: 'success',
      title: 'Email Verified',
      summary: 'Your email has been successfully verified.',
      details: null,
      buttonText: 'Go to Login Page',
      buttonUrl: loginUrl,
    });
  }
);
/**
 * Endpoint to send the verification email.
 * @openapi
 * components:
 *   responses:
 *     SendVerificationEmailResponse:
 *       description: Responds with the expiration time of the verification token.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenExpireTimestamp:
 *                 type: integer
 *                 description: The token expiration timestamp.
 *             required:
 *               - tokenExpireTimestamp
 */
export const sendVerificationEmailReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    const user = req.user as SelectUser;
    const tokenRecord: SelectToken = await createToken({
      userId: user.id,
      purpose: TokenPurpose.VERIFY_EMAIL,
      ttlSec: env.VERIFY_EMAIL_TOKEN_TTL_SEC,
    }); // If fail => Error 500
    await sendVerificationEmail(user, tokenRecord); // If fail => Error 500
    res.status(200).json({
      tokenExpireTimestamp: tokenRecord.expire.getTime(),
    });
  }
);
