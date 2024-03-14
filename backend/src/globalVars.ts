import zod from 'zod';
import dotenv from 'dotenv';
import {assertIsError} from './utils/error';
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
   * The URL of the client application in development.
   */
  DEV_CLIENT_URL: zod.string(),
  /**
   * The URL of the client application in production.
   */
  PROD_CLIENT_URL: zod.string(),
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
    throw new Error(`Environment validation error: ${error.errors}`);
  }
}
export const env: Env = loadEnv();

/**
 * The URL of the client application.
 */
export const CLIENT_URL: string =
  env.NODE_ENV === NodeEnv.PROD ? env.PROD_CLIENT_URL : env.DEV_CLIENT_URL;
