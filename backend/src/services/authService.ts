/**
 * @fileoverview
 * This file contains the service functions for authentication
 * and email verification.
 * @module
 */

import bcrypt from 'bcrypt';
import sgMail from '@sendgrid/mail';
import {appLogger} from '../utils/logger';
import {env} from '../globalVars';
import {AuthStrategy, SelectUser, users} from '../models/userModel';
import {db} from '../utils/database';
import {TokenPurpose, SelectToken, tokens} from '../models/tokenModel';
import {eq} from 'drizzle-orm';
import ejs from 'ejs';
import path from 'path';

const VERIFICATION_EMAIL_FILE_PATH = path.join(
  __dirname,
  '../../views/verificationEmail.ejs'
);

const logger = appLogger.child({module: 'authService'});
/**
 * Check if the password is valid for the user.
 */
export function validatePassword(
  user: SelectUser,
  password: string
): Promise<boolean> {
  if (!user.passwordHash) {
    throw new Error(`User ${user.id} password hash is null`);
  }
  return bcrypt.compare(password, user.passwordHash);
}

/**
 * Send a verification email to the user using SendGrid.
 */
export async function sendVerificationEmail(
  user: SelectUser,
  tokenRecord: SelectToken
) {
  if (user.id !== tokenRecord.userId) {
    throw new Error(`User ID does not match token user ID: ${user.id}`);
  }
  if (tokenRecord.purpose !== TokenPurpose.VERIFY_EMAIL) {
    throw new Error(`Invalid token purpose: ${tokenRecord.purpose}`);
  }
  if (user.authStrategy !== AuthStrategy.LOCAL) {
    throw new Error(
      `Can not send verification email to user with auth strategy: ${user.authStrategy}`
    );
  }
  if (user.isEmailVerified) {
    throw new Error(`User email is already verified: ${user.email}`);
  }
  const verificationUrl = `${env.FRONTEND_URL}/api/v1/auth/verify-email/${tokenRecord.token}`;
  await sgMail.send({
    to: user.email,
    from: env.EMAIL_SENDER,
    subject: 'Verify your email',
    text: `Please click the link to verify your email:\n ${verificationUrl}`,
    html: await ejs.renderFile(VERIFICATION_EMAIL_FILE_PATH, {
      imageUrl: env.FRONTEND_URL + '/backend/assets/ums_logo.svg',
      verificationUrl: verificationUrl,
      homeUrl: env.FRONTEND_URL,
    }),
  });
  logger.info(
    `Verification email sent. User ID: ${user.id}, Email: ${user.email}`
  );
}
/**
 * Mark the user's email as verified and delete the token.
 */
export async function setEmailVerified(
  tokenRecord: SelectToken
): Promise<void> {
  const {userId, token, purpose} = tokenRecord;
  if (purpose !== TokenPurpose.VERIFY_EMAIL) {
    throw new Error(`Invalid token purpose: ${tokenRecord.purpose}`);
  }
  // Mark the user email as verified and delete the token.
  await db.transaction(async tx => {
    await tx
      .update(users)
      .set({isEmailVerified: true})
      .where(eq(users.id, userId));
    await tx.delete(tokens).where(eq(tokens.token, token));
  });
}
