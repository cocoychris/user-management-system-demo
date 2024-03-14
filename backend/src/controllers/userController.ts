/**
 * Controller for the user routes.
 * @module
 */
import {Request, Response} from 'express';
import {env} from '../globalVars';
import {AuthStrategy, SelectUser} from '../models/userModel';
import {
  CreateUserRequest,
  UpdateMyProfileRequest,
  ResetPasswordRequest,
} from '../schema/userSchema';
import {DAY} from '../utils/time';
import {sendVerificationEmail, validatePassword} from '../services/authService';
import {createToken} from '../services/tokenService';
import {SelectToken, TokenPurpose} from '../models/authModel';
import {
  UserProfile,
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
    const updatedUser: SelectUser = await updateLastActive(user.id);
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
 *              - userProfile
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
    // Update the password.
    await updatePassword(user.id, newPassword);
    res.status(200).json({
      message: 'Password updated',
    });
  }
);
/**
 * Endpoint for creating a new user.
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
 *               tokenExpireTimestamp:
 *                 type: integer
 *                 description: The token expiration timestamp.
 *               userProfile:
 *                 $ref: '#/components/schemas/UserProfile'
 *             required:
 *               - tokenExpireTimestamp
 *               - userProfile
 *     CreateUser409Response:
 *       description: Conflict. The email already exists.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 */
export const createUserReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
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
      type ErrorWithCode = {
        code: string;
      };
      if ((error as ErrorWithCode).code === '23505') {
        res.status(409).json({
          message: 'Email already exists',
        });
        return;
      }
      throw error;
    }
    const tokenRecord: SelectToken = await createToken({
      userId: user.id,
      purpose: TokenPurpose.VERIFY_EMAIL,
      ttlSec: env.VERIFY_EMAIL_TOKEN_TTL_SEC,
    });
    await sendVerificationEmail(user, tokenRecord);
    res.status(201).json({
      tokenExpireTimestamp: tokenRecord.expire.getTime(),
      userProfile: toUserProfile(user),
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
 *               todayBeginTimestamp:
 *                 type: integer
 *                 description: The timestamp of the beginning of today.
 *               sevenDaysAgoTimestamp:
 *                 type: integer
 *                 description: The timestamp of the beginning of 7 days ago.
 *               totalUsers:
 *                 type: integer
 *                 description: The total number of users who have signed up.
 *               activeUsersToday:
 *                 type: integer
 *                 description: The total number of users with active sessions today.
 *               averageActiveUsersLast7Days:
 *                 type: number
 *                 description: The average number of active session users in the last 7 days rolling.
 *             required:
 *               - todayBeginTimestamp
 *               - sevenDaysAgoTimestamp
 *               - totalUsers
 *               - activeUsersToday
 *               - averageActiveUsersLast7Days
 */
export const getStatisticsReqHandler = asyncCatch(
  async (req: Request, res: Response) => {
    const todayBeginTimestamp = Date.now() - 1 * DAY.IN_MS;
    // Total number of users who have signed up.
    const totalUsers = await countUsers();
    // Total number of users with active sessions today.
    const activeUsersToday = await countActiveUsersSince(todayBeginTimestamp);
    // Average number of active session users in the last 7 days rolling.
    const sevenDaysAgoTimestamp = Date.now() - 7 * DAY.IN_MS;
    const activeUsersLast7Days = await countActiveUsersSince(
      sevenDaysAgoTimestamp
    );
    const averageActiveUsersLast7Days = Number(
      (activeUsersLast7Days / 7).toFixed(2)
    );
    // Send the response
    res.status(200).json({
      todayBeginTimestamp,
      sevenDaysAgoTimestamp,
      totalUsers,
      activeUsersToday,
      averageActiveUsersLast7Days,
    });
  }
);
