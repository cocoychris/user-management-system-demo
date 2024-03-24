import {ZodError, ZodSchema, z} from 'zod';
import {assertIsError} from './utils/error';

export const nameSchema = z
  .string()
  .min(1, {
    message: 'Name must be at least 1 character long',
  })
  .max(100, {
    message: 'Name must be at most 100 characters long',
  });
export const emailSchema = z
  .string()
  .email({
    message: 'Email must be a valid email address',
  })
  .max(256, {
    message: 'Email must be at most 256 characters long',
  });
export const passwordSchema = z
  .string()
  .min(8, {
    message: 'Password must be at least 8 characters long',
  })
  .max(128, {message: 'Password must be at most 128 characters long'});
export const newPasswordSchema = z
  .string()
  .min(8, {message: 'Password must be at least 8 characters long'})
  .max(128, {message: 'Password must be at most 128 characters long'})
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

// TODO: Remove this function
/**
 * Validates a value against a schema and returns an error message if the
 * value is invalid. Returns an empty string if the value is valid.
 */
export function validate(
  value: unknown,
  schema: ZodSchema,
  ignoreEmpty = false
) {
  if (ignoreEmpty && !value) {
    return '';
  }
  try {
    schema.parse(value);
    return '';
  } catch (error) {
    assertIsError(error, ZodError);
    return error.errors[0].message;
  }
}
