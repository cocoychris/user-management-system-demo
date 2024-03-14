/**
 * Service for token operations and management.
 * @module
 */
import {eq, lt} from 'drizzle-orm';
import {db} from '../utils/database';
import {SelectToken, tokens} from '../models/authModel';
import {appLogger} from '../utils/logger';
import {assertIsError} from '../utils/error';
import {MIN, SEC} from '../utils/time';
import crypto from 'crypto';
import {TokenPurpose} from '../models/authModel';

const logger = appLogger.child({module: 'tokenService'});
const DEFAULT_INTERVAL = 30 * MIN.IN_MS;
let gcInterval: NodeJS.Timeout | null = null;

/**
 * Create a token for the user.
 * This will create a new record in the tokens table.
 * @returns The created token record.
 */
export async function createToken(options: {
  userId: number;
  purpose: TokenPurpose;
  ttlSec: number;
}): Promise<SelectToken> {
  const {userId, purpose, ttlSec} = options;
  // Will try to generate a unique token for a maximum of 3 times in case
  // of collision.
  const maxAttempt = 3;
  for (let attempt = 1; attempt <= maxAttempt; attempt++) {
    try {
      // This will generate a 44 character string.
      // If padding is used, the length of the encoded string would
      // be 4 * ceil(n / 3) for n bytes of input.
      const token: string = crypto.randomBytes(32).toString('base64url');
      const tokenRecord: SelectToken = (
        await db
          .insert(tokens)
          .values({
            token,
            userId,
            purpose,
            expire: new Date(Date.now() + ttlSec * SEC.IN_MS),
          })
          .returning()
      )[0];
      logger.info(
        `Token generated for user ID ${tokenRecord.userId}: ${token}`
      );
      return tokenRecord;
    } catch (error) {
      assertIsError(error);
      if (attempt < maxAttempt) {
        logger.warn(
          `Retrying to generate unique token due to error: ${error.message}`
        );
        continue;
      }
      throw new Error(
        `Failed to generate unique token after ${maxAttempt} attempts: ${error.message}`
      );
    }
  }
  throw new Error('No token generated');
}
/**
 * Deletes the token from the database.
 */
export async function deleteToken(token: string) {
  try {
    await db.delete(tokens).where(eq(tokens.token, token));
  } catch (error) {
    assertIsError(error);
    throw new Error(`Failed to delete token: ${error.message}`);
  }
}
/**
 * Validates the token and returns the token record if valid.
 */
export async function validateToken(
  token: string,
  purpose: TokenPurpose
): Promise<SelectToken | null> {
  const tokenRecord: SelectToken | undefined = await db.query.tokens.findFirst({
    where: eq(tokens.token, token),
  });
  if (!tokenRecord) {
    return null; // Token not found
  }
  if (tokenRecord.purpose !== purpose) {
    return null; // Token purpose mismatch
  }
  if (tokenRecord.expire.getTime() < Date.now()) {
    return null; // Token expired
  }
  return tokenRecord;
}

/**
 * Start the token garbage collection.
 * @param intervalMs The interval in milliseconds to run the garbage collection.
 */
export async function tokenGcStart(intervalMs: number = DEFAULT_INTERVAL) {
  if (gcInterval) {
    logger.warn(new Error('Token garbage collection already running').stack);
    return;
  }
  logger.info(
    `Starting token garbage collection with interval ${intervalMs} ms`
  );
  gcInterval = setInterval(deleteExpiredTokens, intervalMs);
}
/**
 * Stop the token garbage collection.
 */
export async function tokenGcStop() {
  logger.info('Stopping token garbage collection');
  if (gcInterval) {
    clearInterval(gcInterval);
    gcInterval = null;
  }
}
/**
 * Check if the garbage collection is running.
 */
export function isTokenGcRunning() {
  return gcInterval !== null;
}

async function deleteExpiredTokens() {
  const now = new Date();
  try {
    const result = await db.delete(tokens).where(lt(tokens.expire, now));
    logger.info(`Deleted ${result.rowCount} expired tokens`);
  } catch (error) {
    assertIsError(error);
    logger.error(`Error deleting expired tokens: ${error.message}`);
  }
}
