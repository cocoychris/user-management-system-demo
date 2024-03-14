import {infer as ZodInfer, object, string} from 'zod';
import {emailSchema, passwordSchema} from './userSchema';

/**
 * Schema for the check status request.
 *
 * The request payload is empty.
 */
export const checkStatusReqSchema = object({});
/**
 * Schema for the login request.
 * @openapi
 * components:
 *   requestBodies:
 *     LoginRequest:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 $ref: '#/components/schemas/Email'
 *               password:
 *                 $ref: '#/components/schemas/Password'
 *             required:
 *               - email
 *               - password
 */
export const loginReqSchema = object({
  body: object({
    email: emailSchema,
    password: passwordSchema,
  }),
});
/**
 * Schema for the logout request.
 *
 * The request payload is empty.
 */
export const logoutReqSchema = object({});
/**
 * Schema for the verify email request.
 * @openapi
 * components:
 *   parameters:
 *     VerifyEmailParamToken:
 *       name: token
 *       in: path
 *       description: The token for verifying the user's email.
 *       required: true
 *       schema:
 *         type: string
 *         minLength: 43
 *         maxLength: 44
 */
export const verifyEmailReqSchema = object({
  params: object({
    token: string().max(44).min(43),
  }),
});
/**
 * Schema for the send verification email request.
 *
 * The request payload is empty.
 */
export const sendVerificationEmailReqSchema = object({});

/**
 * The inferred type of the check status request.
 */
export type CheckStatusRequest = ZodInfer<typeof checkStatusReqSchema>;
/**
 * The inferred type of the login request.
 */
export type LoginRequest = ZodInfer<typeof loginReqSchema>;
/**
 * The inferred type of the logout request.
 */
export type LogoutRequest = ZodInfer<typeof logoutReqSchema>;
/**
 * The inferred type of the verify email request.
 */
export type VerifyEmailRequest = ZodInfer<typeof verifyEmailReqSchema>;
/**
 * The inferred type of the send verification email request.
 */
export type SendVerificationEmailRequest = ZodInfer<
  typeof sendVerificationEmailReqSchema
>;
