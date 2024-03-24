/**
 * @fileoverview
 * This file contains the service functions for user management.
 * Which includes creating, updating, and getting user profiles.
 * @module
 */

import bcrypt from 'bcrypt';
import {db} from '../utils/database';
import {appLogger} from '../utils/logger';
import {AuthStrategy, InsertUser, SelectUser, users} from '../models/userModel';
import {eq, count, gte, and} from 'drizzle-orm';
import {env} from '../globalVars';
import {UserProfile} from '../schema/userSchema';

const logger = appLogger.child({module: 'userService'});
/**
 * Create a new user in the database and return the created user.
 * If the `authStrategy` is `local`, the `password` is required.
 * If the `authStrategy` is not `local`, the `externalId` is required.
 */
export async function createUser(options: {
  name: string;
  email: string;
  password?: string;
  authStrategy: AuthStrategy;
  externalId?: string;
}): Promise<SelectUser> {
  if (options.authStrategy === AuthStrategy.LOCAL && !options.password) {
    throw new Error('Password is required for local strategy');
  }
  if (options.authStrategy !== AuthStrategy.LOCAL && !options.externalId) {
    throw new Error('External ID is required for non-local strategy');
  }
  const passwordHash =
    options.password && (await bcrypt.hash(options.password, env.SALT_ROUNDS));
  const user: InsertUser = {
    name: options.name,
    email: options.email,
    passwordHash,
    authStrategy: options.authStrategy,
    externalId: options.externalId,
    isEmailVerified: options.authStrategy === AuthStrategy.LOCAL ? false : true,
    createdAt: new Date(),
    lastActiveAt: undefined,
    loginCount: undefined,
  };
  const createdUser: SelectUser = (
    await db.insert(users).values(user).returning()
  )[0];
  logger.info(`User created: ${createdUser.id}`);
  return createdUser;
}

/**
 * Find the user by the ID
 * Returns null if the user is not found.
 */
export async function findUserById(userId: number): Promise<SelectUser | null> {
  const user: SelectUser | undefined = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user || null;
}
/**
 * Find the user by the external ID and authentication strategy.
 * Returns null if the user is not found.
 */
export async function findUserByExternalId(
  authStrategy: AuthStrategy,
  externalId: string
): Promise<SelectUser | null> {
  if (authStrategy === AuthStrategy.LOCAL) {
    throw new Error('Cannot find external user with local strategy');
  }
  const user: SelectUser | undefined = await db.query.users.findFirst({
    where: and(
      eq(users.authStrategy, authStrategy),
      eq(users.externalId, externalId)
    ),
  });
  return user || null;
}
/**
 * Extract the user profile from the user data.
 * The user profile is the data that is sent to the client,
 * which is a subset of the `SelectUser` type.
 */
export function toUserProfile(user: SelectUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
    loginCount: user.loginCount,
  };
}
/**
 * Update the user profile with the given fields and return the updated user profile.
 */
export async function updateUserProfile(
  userId: number,
  fields: Partial<UserProfile>
): Promise<UserProfile> {
  const user = (
    await db.update(users).set(fields).where(eq(users.id, userId)).returning()
  )[0];
  return toUserProfile(user);
}
/**
 * Update the last active time of the user.
 * Will also increment the login count if `isLogin` is true.
 */
export async function updateLastActive(
  userId: number,
  isLogin = false
): Promise<SelectUser> {
  // Using transaction to ensure atomic update of the user.
  return db.transaction(async tx => {
    const updateValues: Partial<InsertUser> = {
      lastActiveAt: new Date(),
    };
    if (isLogin) {
      const results = await tx
        .select({
          loginCount: users.loginCount,
        })
        .from(users)
        .where(eq(users.id, userId));
      updateValues.loginCount = results[0].loginCount + 1;
    }
    return (
      await tx
        .update(users)
        .set(updateValues)
        .where(eq(users.id, userId))
        .returning()
    )[0];
  });
}

export async function updatePassword(
  userId: number,
  newPassword: string
): Promise<void> {
  await db
    .update(users)
    .set({
      passwordHash: await bcrypt.hash(newPassword, env.SALT_ROUNDS),
    })
    .where(eq(users.id, userId));
}

export async function countUsers(): Promise<number> {
  const result = await db.select({value: count(users.id)}).from(users);
  return result[0].value;
}
/**
 * Count the number of users who have been active after the given date or timestamp.
 */
export async function countActiveUsersSince(
  dateOrTimestamp: Date | number
): Promise<number> {
  const date =
    dateOrTimestamp instanceof Date
      ? dateOrTimestamp
      : new Date(dateOrTimestamp);
  const result = await db
    .select({value: count(users.id)})
    .from(users)
    .where(gte(users.lastActiveAt, date));
  return result[0].value;
}

export async function getAllUserProfile(): Promise<UserProfile[]> {
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isEmailVerified: users.isEmailVerified,
      createdAt: users.createdAt,
      lastActiveAt: users.lastActiveAt,
      loginCount: users.loginCount,
    })
    .from(users)
    .orderBy(users.createdAt);
  //.limit(100).offset(0); // Maybe add pagination later.
}
