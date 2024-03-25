/**
 * @fileoverview
 * This file contains the schema for the user routes.
 * The schema is used for request validation and documentation.
 * It also provides the inferred types for the request payloads.
 * @module
 */

import {infer as ZodInfer, object, string} from 'zod';
import {SelectUser} from '../models/userModel';

/**
 * Schema for the name.
 * @openapi
 * components:
 *   schemas:
 *     Name:
 *       type: string
 *       minLength: 1
 *       maxLength: 100
 *       example: 'Snoopy'
 */
export const nameSchema = string().min(1).max(100);
/**
 * Schema for the email.
 * @openapi
 * components:
 *   schemas:
 *     Email:
 *       type: string
 *       format: email
 *       maxLength: 256
 *       example: 'snoopy@email-example.com'
 */
export const emailSchema = string().email().max(256);
/**
 * Schema for the existing password.
 * @openapi
 * components:
 *   schemas:
 *     Password:
 *       type: string
 *       minLength: 8
 *       maxLength: 128
 *       example: 'IamSnoopy123!'
 */
export const passwordSchema = string().min(8).max(128);
/**
 * Schema for the new password.
 * @openapi
 * components:
 *   schemas:
 *     NewPassword:
 *       type: string
 *       minLength: 8
 *       maxLength: 128
 *       description: |
 *         The password must meet the following requirements:
 *         - At least one uppercase letter
 *         - At least one lowercase letter
 *         - At least one number
 *         - At least one special character
 *       example: 'HelloKitty543!'
 */
export const newPasswordSchema = string()
  .min(8)
  .max(128)
  .refine(password => /[A-Z]/.test(password), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine(password => /[a-z]/.test(password), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine(password => /[0-9]/.test(password), {
    message: 'Password must contain at least one number',
  })
  .refine(password => /\W|_/.test(password), {
    message: 'Password must contain at least one special character',
  });

/**
 * Schema for the get me (user profile) request.
 *
 * The request payload is empty.
 */
export const getMyProfileReqSchema = object({});
/**
 * Schema for the update me (user profile) request.
 * @openapi
 * components:
 *   requestBodies:
 *     UpdateMyProfileRequest:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 $ref: '#/components/schemas/Name'
 *             required:
 *               - name
 */
export const updateMyProfileReqSchema = object({
  body: object({
    name: nameSchema.optional(),
  }),
});
/**
 * Schema for the reset password request.
 * @openapi
 * components:
 *   requestBodies:
 *     ResetPasswordRequest:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 $ref: '#/components/schemas/Password'
 *               newPassword:
 *                 $ref: '#/components/schemas/NewPassword'
 *               confirmPassword:
 *                 $ref: '#/components/schemas/NewPassword'
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 */
export const resetPasswordReqSchema = object({
  body: object({
    oldPassword: passwordSchema,
    newPassword: newPasswordSchema,
    confirmPassword: newPasswordSchema,
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password not match',
  }),
});
/**
 * Schema for the create user request.
 * @openapi
 * components:
 *   requestBodies:
 *     CreateUserRequest:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 $ref: '#/components/schemas/Name'
 *               email:
 *                 $ref: '#/components/schemas/Email'
 *               password:
 *                 $ref: '#/components/schemas/NewPassword'
 *               confirmPassword:
 *                 $ref: '#/components/schemas/NewPassword'
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 */
export const createUserReqSchema = object({
  body: object({
    name: nameSchema,
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: newPasswordSchema,
  }).refine(data => data.password === data.confirmPassword, {
    message: 'New password and confirm password not match',
  }),
});
/**
 * Schema for the get users request.
 *
 * The request payload is empty.
 */
export const getAllUsersReqSchema = object({});
/**
 * Schema for the get statistics request.
 *
 * The request payload is empty.
 */
export const getStatisticsReqSchema = object({});

/**
 * The inferred type of the get me request.
 */
export type GetMyProfileRequest = ZodInfer<typeof getMyProfileReqSchema>;
/**
 * The inferred type of the update user profile request.
 */
export type UpdateMyProfileRequest = ZodInfer<typeof updateMyProfileReqSchema>;
/**
 * The inferred type of the reset password request.
 */
export type ResetPasswordRequest = ZodInfer<typeof resetPasswordReqSchema>;
/**
 * The inferred type of the create user request.
 */
export type CreateUserRequest = ZodInfer<typeof createUserReqSchema>;
/**
 * The inferred type of the get users request.
 */
export type GetAllUsersRequest = ZodInfer<typeof getAllUsersReqSchema>;
/**
 * The inferred type of the get statistics request.
 */
export type GetStatisticsRequest = ZodInfer<typeof getStatisticsReqSchema>;

/**
 * The data type for the user profile, which is a subset of the `SelectUser` type.
 * Note that this is only used for the response payload.
 * @openapi
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID.
 *           example: 1
 *         name:
 *           type: string
 *           description: The user's name.
 *           example: 'Snoopy'
 *         email:
 *           type: string
 *           description: The user's email.
 *           example: 'snoopy@email-example.com'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time when the user was created.
 *           example: '2024-03-15T13:11:33.957Z'
 *         lastActiveAt:
 *           type: string
 *           format: date-time
 *           description: The time when the user was last active.
 *           example: '2024-03-15T13:11:33.957Z'
 *         loginCount:
 *           type: integer
 *           description: The number of times the user has logged in.
 *           example: 5
 *       required:
 *         - id
 *         - name
 *         - email
 *         - createdAt
 *         - lastActiveAt
 *         - loginCount
 */
export type UserProfile = Pick<
  SelectUser,
  'id' | 'name' | 'email' | 'createdAt' | 'lastActiveAt' | 'loginCount'
>;
