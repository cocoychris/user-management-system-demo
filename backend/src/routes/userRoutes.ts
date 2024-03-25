/**
 * @fileoverview
 * This file contains the routes for user management.
 * @module
 */

import {Router} from 'express';
import {
  parseRequest,
  ensureAuthenticated,
  ensureEmailVerified,
  ensureAuthStrategy,
} from '../middleware';
import {
  getAllUsersReqSchema,
  createUserReqSchema,
  updateMyProfileReqSchema,
  getStatisticsReqSchema,
  resetPasswordReqSchema,
  getMyProfileReqSchema,
} from '../schema/userSchema';
import {
  getMyProfileReqHandler,
  getAllUsersReqHandler,
  createUserReqHandler,
  updateMyProfileReqHandler,
  getStatisticsReqHandler,
  resetPasswordReqHandler,
} from '../controllers/userController';
import {AuthStrategy} from '../models/userModel';
import {doubleCsrfProtection} from '../utils/csrf';

/**
 * Router for the authentication & user management API.
 */
export const userRouter = Router();
const router = userRouter;
/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - user
 *     description: Get the current user's profile.
 *     operationId: getMyProfile
 *     responses:
 *       200:
 *         $ref: '#/components/responses/GetMyProfileResponse'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       401:
 *         $ref: '#/components/responses/EnsureAuthenticated401Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.get(
  '/me',
  parseRequest(getMyProfileReqSchema),
  ensureAuthenticated(true),
  getMyProfileReqHandler
);
/**
 * @openapi
 * /users/me:
 *   put:
 *     tags:
 *       - user
 *     parameters:
 *       - $ref: '#/components/parameters/CSRFTokenHeader'
 *     description: Update the current user's profile.
 *     operationId: updateMyProfile
 *     requestBody:
 *       $ref: '#/components/requestBodies/UpdateMyProfileRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UpdateMyProfileResponse'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       401:
 *         $ref: '#/components/responses/EnsureAuthenticated401Response'
 *       403:
 *         $ref: '#/components/responses/DoubleCsrfProtection403Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.put(
  '/me',
  doubleCsrfProtection,
  parseRequest(updateMyProfileReqSchema),
  ensureAuthenticated(true),
  updateMyProfileReqHandler
);
/**
 * @openapi
 * /users/me/password:
 *   put:
 *     tags:
 *       - user
 *     parameters:
 *       - $ref: '#/components/parameters/CSRFTokenHeader'
 *     description: Reset the current user's password.
 *     operationId: resetPassword
 *     requestBody:
 *       $ref: '#/components/requestBodies/ResetPasswordRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ResetPasswordResponse'
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
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.put(
  '/me/password',
  doubleCsrfProtection,
  parseRequest(resetPasswordReqSchema),
  ensureAuthenticated(true),
  ensureAuthStrategy(AuthStrategy.LOCAL),
  resetPasswordReqHandler
);

/**
 * @openapi
 * /users/me:
 *   post:
 *     tags:
 *       - user
 *     description: Create a user.
 *     operationId: createUser
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateUserRequest'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/CreateUser201Response'
 *       409:
 *         $ref: '#/components/responses/CreateUser409Response'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       403:
 *         $ref: '#/components/responses/EnsureAuthenticated403Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.post(
  '/me',
  parseRequest(createUserReqSchema),
  ensureAuthenticated(false),
  createUserReqHandler
);
/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - user
 *     description: Get all users.
 *     operationId: getAllUsers
 *     responses:
 *       200:
 *         $ref: '#/components/responses/GetAllUsersResponse'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       401:
 *         $ref: '#/components/responses/EnsureAuthenticated401Response'
 *       403:
 *         $ref: '#/components/responses/EnsureEmailVerified403Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.get(
  '/',
  parseRequest(getAllUsersReqSchema),
  ensureAuthenticated(true),
  ensureEmailVerified(true),
  getAllUsersReqHandler
);
/**
 * @openapi
 * /users/statistics:
 *   get:
 *     tags:
 *       - user
 *     description: Get the statistics of the users.
 *     operationId: getStatistics
 *     responses:
 *       200:
 *         $ref: '#/components/responses/GetStatisticsResponse'
 *       400:
 *         $ref: '#/components/responses/ParseRequest400Response'
 *       401:
 *         $ref: '#/components/responses/EnsureAuthenticated401Response'
 *       403:
 *         $ref: '#/components/responses/EnsureEmailVerified403Response'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.get(
  '/statistics',
  parseRequest(getStatisticsReqSchema),
  ensureAuthenticated(true),
  ensureEmailVerified(true),
  getStatisticsReqHandler
);
