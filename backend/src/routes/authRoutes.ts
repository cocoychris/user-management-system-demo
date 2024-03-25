/**
 * @fileoverview
 * This file contains the routes for authentication.
 * @module
 */

import {Router} from 'express';
import {
  parseRequest,
  ensureAuthenticated,
  ensureEmailVerified,
  ensureAuthStrategy,
  internalServerErrorHtmlHandler,
} from '../middleware';
import {
  checkStatusReqSchema,
  loginReqSchema,
  logoutReqSchema,
  sendVerificationEmailReqSchema,
} from '../schema/authSchema';
import {
  checkStatusReqHandler,
  googleAuthCallbackReqHandler,
  googleAuthReqHandler,
  loginReqHandler,
  logoutReqHandler,
  sendVerificationEmailReqHandler,
  verifyEmailReqHandler,
} from '../controllers/authController';
import {AuthStrategy} from '../models/userModel';
import {doubleCsrfProtection} from '../utils/csrf';

/**
 * Router for the authentication & user management API.
 */
export const authRouter = Router();
const router = authRouter;
/**
 * @openapi
 * /auth/check-status:
 *   get:
 *     description: Retrieve the user's authentication status. The user is considered authenticated if the session cookie is valid.
 *     operationId: checkAuthStatus
 *     tags:
 *       - auth
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CheckStatusResponse'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.get(
  '/check-status',
  parseRequest(checkStatusReqSchema), // Can respond with 400 if the request is invalid.
  checkStatusReqHandler
);
/**
 * @openapi
 * /auth/login:
 *  post:
 *     description: Authenticate the user using the local strategy (email and password).
 *     operationId: login
 *     tags:
 *       - auth
 *     requestBody:
 *       $ref: '#/components/requestBodies/LoginRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/LoginResponse'
 *       401:
 *         $ref: '#/components/responses/Login401Response'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       403:
 *         $ref: '#/components/responses/EnsureAuthenticated403Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.post(
  '/login',
  parseRequest(loginReqSchema), // Can respond with 400 if the request is invalid.
  ensureAuthenticated(false), // Can respond with 403 if the user is already authenticated.
  loginReqHandler
);
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     description: Log out the user.
 *     operationId: logout
 *     tags:
 *       - auth
 *     parameters:
 *       - $ref: '#/components/parameters/CSRFTokenHeader'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/LogoutResponse'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       401:
 *         $ref: '#/components/responses/EnsureAuthenticated401Response'
 *       403:
 *         $ref: '#/components/responses/DoubleCsrfProtection403Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.post(
  '/logout',
  doubleCsrfProtection, // Can respond with 403 if the CSRF token is invalid.
  parseRequest(logoutReqSchema), // Can respond with 400 if the request is invalid.
  ensureAuthenticated(true), // Can respond with 401 if the user is not authenticated.
  logoutReqHandler
);
/**
 * @openapi
 * /auth/verify-email/{token}:
 *   get:
 *     description: Verify the user's email using the token.
 *     operationId: verifyEmail
 *     tags:
 *       - auth
 *     parameters:
 *       - $ref: '#/components/parameters/VerifyEmailParamToken'
 *     responses:
 *       302:
 *         $ref: '#/components/responses/VerifyEmail302Response'
 *       400:
 *         $ref: '#/components/responses/VerifyEmail400HtmlResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorHtmlResponse'
 */
router.get(
  '/verify-email/:token',
  verifyEmailReqHandler,
  internalServerErrorHtmlHandler
);
/**
 * @openapi
 * /auth/send-verification-email:
 *   post:
 *     description: Send the verification email to the user.
 *     operationId: sendVerificationEmail
 *     tags:
 *       - auth
 *     parameters:
 *       - $ref: '#/components/parameters/CSRFTokenHeader'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/SendVerificationEmailResponse'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       401:
 *         $ref: '#/components/responses/EnsureAuthenticated401Response'
 *       403:
 *         description: Forbidden. The auth strategy is not local or the CSRF token is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorSchema'
 *       409:
 *         $ref: '#/components/responses/EnsureEmailVerified409Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.post(
  '/send-verification-email',
  doubleCsrfProtection, // Can respond with 403 if the CSRF token is invalid.
  parseRequest(sendVerificationEmailReqSchema), // Can respond with 400 if the request is invalid.
  ensureAuthenticated(true), // Can respond with 401 if the user is not authenticated.
  ensureAuthStrategy(AuthStrategy.LOCAL), // Can respond with 403 if the auth strategy is not local.
  ensureEmailVerified(false), // Can respond with 409 if the email is already verified.
  sendVerificationEmailReqHandler
);
/**
 * @openapi
 * /auth/google:
 *   get:
 *     description: Authenticate the user using Google OAuth.
 *     operationId: googleAuth
 *     tags:
 *       - auth
 *     responses:
 *       302:
 *         $ref: '#/components/responses/GoogleAuth302Response'
 *       403:
 *         $ref: '#/components/responses/GoogleAuth403HtmlResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorHtmlResponse'
 */
router.get('/google', googleAuthReqHandler, internalServerErrorHtmlHandler);
/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     description: Callback for Google OAuth. Will redirect to the dashboard if successful.
 *     operationId: googleAuthCallback
 *     tags:
 *       - auth
 *     responses:
 *       302:
 *         $ref: '#/components/responses/GoogleAuthCallback302Response'
 *       403:
 *         $ref: '#/components/responses/GoogleAuthCallback403HtmlResponse'
 *       400:
 *         $ref: '#/components/responses/GoogleAuthCallback400HtmlResponse'
 *       409:
 *         $ref: '#/components/responses/GoogleAuthCallback409HtmlResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorHtmlResponse'
 */
router.get(
  '/google/callback',
  googleAuthCallbackReqHandler,
  internalServerErrorHtmlHandler
);
