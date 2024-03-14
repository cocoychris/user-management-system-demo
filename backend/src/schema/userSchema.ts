import {infer as ZodInfer, object, string} from 'zod';

/**
 * Schema for the name.
 * @openapi
 * components:
 *   schemas:
 *     Name:
 *       type: string
 *       minLength: 1
 *       maxLength: 100
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
// TODO: Implement or delete pagination feature.
// export const getAllUsersReqSchema = object({
//   query: object({
//     page: number().default(1),
//     pageSize: number().default(10),
//   }),
// });
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
