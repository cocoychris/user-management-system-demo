/**
 * Routes for authentication.
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
  loginReqHandler,
  logoutReqHandler,
  sendVerificationEmailReqHandler,
  verifyEmailReqHandler,
} from '../controllers/authController';
import {AuthStrategy} from '../models/userModel';

/**
 * Router for the authentication & user management API.
 */
export const authRouter = Router();
const router = authRouter;
/**
 * @openapi
 * /auth/check-status:
 *   get:
 *     description: Check the authentication status of the user.
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
  parseRequest(checkStatusReqSchema),
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
  parseRequest(loginReqSchema),
  ensureAuthenticated(false),
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
 *     responses:
 *       200:
 *         $ref: '#/components/responses/LogoutResponse'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       401:
 *         $ref: '#/components/responses/EnsureAuthenticated401Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.post(
  '/logout',
  parseRequest(logoutReqSchema),
  ensureAuthenticated(true),
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
 *       200:
 *         $ref: '#/components/responses/VerifyEmailHtmlResponse'
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
 *     responses:
 *       200:
 *         $ref: '#/components/responses/SendVerificationEmailResponse'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       401:
 *         $ref: '#/components/responses/EnsureAuthenticated401Response'
 *       403:
 *         $ref: '#/components/responses/EnsureAuthStrategy403Response'
 *       409:
 *         $ref: '#/components/responses/EnsureEmailVerified409Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.post(
  '/send-verification-email',
  parseRequest(sendVerificationEmailReqSchema),
  ensureAuthenticated(true),
  ensureAuthStrategy(AuthStrategy.LOCAL),
  ensureEmailVerified(false),
  sendVerificationEmailReqHandler
);
