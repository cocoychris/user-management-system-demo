/**
 * @fileoverview
 * This file contains the global variables for the application.
 * It also loads the environment variables from the .env file and validates them.
 * @module
 */
import zod from 'zod';
import dotenv from 'dotenv';
import {assertIsError, zodErrorToMessage} from './utils/error';
import {DAY} from './utils/time';

/**
 * Enumerates the possible values for the NODE_ENV environment variable.
 */
export enum NodeEnv {
  DEV = 'development',
  PROD = 'production',
}
/**
 * The schema for the environment variables.
 */
/**
 * Schema for environment variables.
 */
const envSchema = zod.object({
  /**
   * The environment the application is running in.
   */
  NODE_ENV: zod.nativeEnum(NodeEnv),
  /**
   * The port the application will listen on.
   */
  PORT: zod.coerce.number().default(3000),
  /**
   * The URL of the frontend application.
   */
  FRONTEND_URL: zod.string(),
  /**
   * The URI for the PostgreSQL database.
   */
  POSTGRES_URI: zod.string(),
  /**
   * The secret used to sign the session cookie.
   */
  COOKIE_SECRET: zod.string(),
  /**
   * The number of salt rounds to use for hashing passwords.
   */
  SALT_ROUNDS: zod.coerce.number().default(10),
  /**
   * The maximum age of the session cookie in seconds.
   */
  COOKIE_MAX_AGE_SEC: zod.coerce.number().default(1 * DAY.IN_SEC),
  /**
   * The time-to-live for the session in seconds.
   */
  SESSION_TTL_SEC: zod.coerce.number().default(1 * DAY.IN_SEC),
  /**
   * The time-to-live for the email verification token in seconds.
   */
  VERIFY_EMAIL_TOKEN_TTL_SEC: zod.coerce.number().default(1 * DAY.IN_SEC),
  /**
   * The API key for SendGrid email service.
   */
  SENDGRID_API_KEY: zod.string(),
  /**
   * The email address to send the verification emails from.
   */
  EMAIL_SENDER: zod.string(),
  /**
   * The Client ID for Google OAuth.
   */
  GOOGLE_CLIENT_ID: zod.string(),
  /**
   * The Client Secret for Google OAuth.
   */
  GOOGLE_CLIENT_SECRET: zod.string(),
  /**
   * Indicates whether to use CORS.
   */
  USE_CORS: zod.string().transform(value => value === 'true'),
  /**
   * The secret for CSRF tokens.
   */
  CSRF_SECRET: zod.string(),
});
// Load the environment variables from the .env file.
export type Env = zod.infer<typeof envSchema>;
function loadEnv(): Env {
  const result = dotenv.config();
  if (result.error) {
    throw new Error(`Error loading .env file: ${result.error}`);
  }
  try {
    return envSchema.parse(result.parsed);
  } catch (error) {
    assertIsError(error, zod.ZodError);
    throw new Error(
      `Environment validation error: ${zodErrorToMessage(error)}`
    );
  }
}

/**
 * The environment variables.
 */
export const env: Env = loadEnv();
