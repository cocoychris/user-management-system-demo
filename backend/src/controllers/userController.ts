import {NextFunction} from 'express';
/**
 * @fileoverview
 * This file contains the controller for the users routes.
 *
 * Controllers are the end point middleware of a route.
 * It implements the main business logic of the route,
 * and is responsible for sending the response.
 * @module
 */

import {Request, Response} from 'express';
import {env} from '../globalVars';
import {AuthStrategy, SelectUser} from '../models/userModel';
import {
  CreateUserRequest,
  UpdateMyProfileRequest,
  ResetPasswordRequest,
  UserProfile,
} from '../schema/userSchema';
import {DAY} from '../utils/time';
import {sendVerificationEmail, validatePassword} from '../services/authService';
import {createToken} from '../services/tokenService';
import {SelectToken, TokenPurpose} from '../models/tokenModel';
import {
  countActiveUsersSince,
  countUsers,
  createUser,
  getAllUserProfile,
  toUserProfile,
  updateLastActive,
  updatePassword,
  updateUserProfile,
} from '../services/userService';
import {asyncCatch} from '../middleware';
import {assertIsErrorWithCode} from '../utils/error';
import {appLogger} from '../utils/logger';
import {generateToken} from '../utils/csrf';
/**
 * Endpoint for getting the current user's profile.
 * @openapi
 * components:
 *   responses:
 *     GetMyProfileResponse:
 *       description: Responds with the current user's profile.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userProfile:
 *                 $ref: '#/components/schemas/UserProfile'
 *             required:
 *               - userProfile
 */

export const getMyProfileReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    const user = req.user as SelectUser;
    const updatedUser: SelectUser = await updateLastActive(user.id, false);
    res.status(200).json({
      userProfile: toUserProfile(updatedUser),
    });
  }
);
/**
 * Endpoint for updating the current user's profile.
 * @openapi
 * components:
 *   responses:
 *     UpdateMyProfileResponse:
 *       description: Responds with the updated user profile.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userProfile:
 *                 $ref: '#/components/schemas/UserProfile'
 *             required:
 *               - userProfile
 */
export const updateMyProfileReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    const user = req.user as SelectUser;
    const {name} = req.body as UpdateMyProfileRequest['body'];
    const updatedUserProfile = await updateUserProfile(user.id, {name});
    res.status(200).json({
      userProfile: updatedUserProfile,
    });
  }
);
/**
 * Endpoint for resetting the password.
 * @openapi
 * components:
 *   responses:
 *     ResetPasswordResponse:
 *       description: Responds with a message indicating the password has been reset.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message indicating the password has been reset.
 *                 example: 'Password updated'
 *             required:
 *               - message
 *     ResetPassword401Response:
 *       description: Unauthorized. The old password is invalid.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 */
export const resetPasswordReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    const user = req.user as SelectUser;
    const {oldPassword, newPassword} = req.body as ResetPasswordRequest['body'];
    const isValid = await validatePassword(user, oldPassword);
    if (!isValid) {
      res.status(401).json({
        message: 'Invalid password',
      });
      return;
    }
    // Check if new password is the same as the old password.
    if (oldPassword === newPassword) {
      res.status(400).json({
        message: 'New password cannot be the same as the old password',
      });
      return;
    }
    // Update the password.
    await updatePassword(user.id, newPassword);
    res.status(200).json({
      message: 'Password updated',
    });
  }
);
/**
 * Endpoint for creating (signing up) a new user.
 * A successful sign up is also considered as a login.
 * @openapi
 * components:
 *   responses:
 *     CreateUser201Response:
 *       description: Responds with the token expiration timestamp and the user profile.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAuthenticated:
 *                 type: boolean
 *                 description: Indicates if the user is authenticated. Usually true after sign up. Might be false if there is an error in login.
 *                 example: true
 *               isEmailVerified:
 *                 type: boolean
 *                 description: Indicates if the user's email is verified. Usually false after sign up.
 *                 example: false
 *               authStrategy:
 *                 type: string
 *                 description: The authentication strategy used to authenticate the user. Only provided if the user is authenticated.
 *                 example: 'local'
 *               csrfToken:
 *                 type: string
 *                 description: The CSRF token for the user session. Usually present if the user is authenticated.
 *                 example: '96a87aac7682fa382d86d81afeb87e9fc32d457bc5f8bb2b9c3e3f547bc20b90b8bb7d5fd9a3a97b3323a79a06d3cf169a8a25449935dd71750dc4722a0f4b77'
 *               userProfile:
 *                 $ref: '#/components/schemas/UserProfile'
 *             required:
 *               - isAuthenticated
 *               - isEmailVerified
 *               - userProfile
 *     CreateUser409Response:
 *       description: Conflict. The email already exists.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 */
export const createUserReqHandler = asyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const {name, email, password} = req.body as CreateUserRequest['body'];
    let user: SelectUser;
    try {
      user = await createUser({
        email,
        name,
        password,
        authStrategy: AuthStrategy.LOCAL,
      });
    } catch (error) {
      assertIsErrorWithCode(error);
      if (error.code === '23505') {
        res.status(409).json({
          message: 'Email already exists',
        });
        return;
      }
      throw error;
    }
    // Sign up is also considered as a login.
    req.login(user, async loginError => {
      if (loginError) {
        appLogger.error(`Error in login after sign up: ${loginError.stack}`);
      }
      if (!loginError) {
        // Increment the login count and update the last active time.
        updateLastActive(user.id, true);
      }
      // Continue to send verification email even if there is an error in login
      // as the user is already created and user can still login later.
      try {
        const tokenRecord: SelectToken = await createToken({
          userId: user.id,
          purpose: TokenPurpose.VERIFY_EMAIL,
          ttlSec: env.VERIFY_EMAIL_TOKEN_TTL_SEC,
        });
        await sendVerificationEmail(user, tokenRecord);
        const isAuthenticated = !loginError;
        res.status(201).json({
          isAuthenticated,
          isEmailVerified: user.isEmailVerified,
          authStrategy: isAuthenticated ? user.authStrategy : undefined,
          csrfToken: isAuthenticated ? generateToken(req, res) : undefined,
          userProfile: toUserProfile(user),
        });
      } catch (error) {
        next(error);
      }
    });
  }
);
/**
 * Endpoint for retrieving all users.
 * @openapi
 * components:
 *   responses:
 *     GetAllUsersResponse:
 *       description: Responds with the list of user profiles.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userProfileList:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/UserProfile'
 *             required:
 *               - userProfileList
 */
export const getAllUsersReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    // Maybe add pagination later.
    // const {page, pageSize} = req.query as unknown as GetAllUsersRequest['query'];
    // const offset = (page - 1) * pageSize;
    const userProfileList: UserProfile[] = await getAllUserProfile();
    // Send the response
    res.status(200).json({
      userProfileList,
    });
  }
);
/**
 * Endpoint for retrieving the statistics of the users.
 * @openapi
 * components:
 *   responses:
 *     GetStatisticsResponse:
 *       description: Responds with the statistics of the users.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               todayBeginDateTime:
 *                 type: string
 *                 description: The beginning of today in ISO 8601 format.
 *                 example: '2024-03-15T00:00:00.000Z'
 *               sevenDaysAgoDateTime:
 *                 type:  string
 *                 description: The date and time 7 days ago in ISO 8601 format.
 *                 example: '2024-03-08T13:11:33.957Z'
 *               totalUsers:
 *                 type: integer
 *                 description: The total number of users who have signed up.
 *                 example: 100
 *               activeUsersToday:
 *                 type: integer
 *                 description: The total number of users with active sessions today.
 *                 example: 50
 *               averageActiveUsersLast7Days:
 *                 type: number
 *                 description: The average number of active session users in the last 7 days rolling.
 *                 example: 60.71
 *             required:
 *               - todayBeginDateTime
 *               - sevenDaysAgoDateTime
 *               - totalUsers
 *               - activeUsersToday
 *               - averageActiveUsersLast7Days
 */
export const getStatisticsReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    const todayBeginDateTime = Date.now() - 1 * DAY.IN_MS;
    // Total number of users who have signed up.
    const totalUsers = await countUsers();
    // Total number of users with active sessions today.
    const activeUsersToday = await countActiveUsersSince(todayBeginDateTime);
    // Average number of active session users in the last 7 days rolling.
    const sevenDaysAgoDateTime = Date.now() - 7 * DAY.IN_MS;
    const activeUsersLast7Days =
      await countActiveUsersSince(sevenDaysAgoDateTime);
    const averageActiveUsersLast7Days = Number(
      (activeUsersLast7Days / 7).toFixed(2)
    );
    // Send the response
    res.status(200).json({
      todayBeginDateTime,
      sevenDaysAgoDateTime,
      totalUsers,
      activeUsersToday,
      averageActiveUsersLast7Days,
    });
  }
);
