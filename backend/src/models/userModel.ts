/**
 * @fileoverview
 * This file contains the ORM schema for all the tables in the database using
 * the `drizzle-orm` library.
 *
 * The TypeScript types are generated from the ORM schema and are used throughout
 * the rest of the application.
 * @module
 */

import {
  char,
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
  integer,
  boolean,
  unique,
} from 'drizzle-orm/pg-core';
import {type InferSelectModel, type InferInsertModel} from 'drizzle-orm';
/**
 * The maximum length of the email field in the `users` table.
 */
const MAX_EMAIL_LENGTH = 256;
/**
 * The maximum length of the name field in the `users` table.
 */
const MAX_NAME_LENGTH = 256;
/**
 * Enumerates the available values for the `authStrategy` property in the `SelectUser` and `InsertUser` types.
 */
export enum AuthStrategy {
  LOCAL = 'local',
  GOOGLE_OAUTH = 'googleOAuth',
}
/**
 * The enum type for the `auth_strategy` column in the `users` table.
 */
export const authStrategyEnum = pgEnum('auth_strategy', [
  AuthStrategy.LOCAL,
  AuthStrategy.GOOGLE_OAUTH,
]);
// # Define the ORM schema for the users table.
/**
 * ORM schema of the `users` table.
 */
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    externalId: varchar('external_id', {length: 256}),
    // Using a length of 256 for the email because: https://blog.moonmail.io/what-is-the-maximum-length-of-a-valid-email-address-f712c6c4bc93
    email: varchar('email', {length: MAX_EMAIL_LENGTH}).unique().notNull(),
    // With bcrypt, the hash (a combination of the salt and password hash) always consists
    // of 60 characters.
    // Could be null if the user is authenticated using a third-party service like Google.
    passwordHash: char('password_hash', {length: 60}),
    name: varchar('name', {length: MAX_NAME_LENGTH}).notNull(),
    authStrategy: authStrategyEnum('auth_strategy').notNull(),
    isEmailVerified: boolean('is_email_verified').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastActiveAt: timestamp('last_active_at'),
    loginCount: integer('login_count').default(0).notNull(),
  },
  table => {
    return {
      authStrategyExternalIdUnique: unique(
        'auth_strategy_external_id_unique'
      ).on(table.authStrategy, table.externalId),
    };
  }
);
// # Transform the ORM schema into types that we can use in the rest of the file.
/**
 * The user model which is returned from the `users` table.
 */
export type SelectUser = InferSelectModel<typeof users>;
/**
 * The user model for inserting into the `users` table.
 */
export type InsertUser = InferInsertModel<typeof users>;
