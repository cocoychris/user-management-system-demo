/**
 * @fileoverview
 * This file contains the Drizzle ORM schema of the `tokens` table.
 *
 * The TypeScript types are generated from the ORM schema and are used throughout
 * the rest of the application.
 * @module
 */

import {
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import {type InferSelectModel, type InferInsertModel} from 'drizzle-orm';
import {users} from './userModel';
/**
 * The length of the token field in the `tokens` table.
 */
const TOKEN_MAX_LENGTH = 44;
/**
 * The enum for the purpose of the token.
 */
export enum TokenPurpose {
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail',
}
/**
 * The enum type for the `purpose` column in the `tokens` table.
 */
export const tokenPurposeEnum = pgEnum('token_purpose', [
  TokenPurpose.RESET_PASSWORD,
  TokenPurpose.VERIFY_EMAIL,
]);
/**
 * ORM schema of the `tokens` table.
 * This is the token that is sent to the user's email when they want to reset their password.
 */
export const tokens = pgTable(
  'tokens',
  {
    token: varchar('token', {length: TOKEN_MAX_LENGTH}).primaryKey(),
    purpose: tokenPurposeEnum('purpose').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expire: timestamp('expire').notNull(),
    userId: integer('user_id')
      .references(() => users.id, {onDelete: 'cascade'}) // Will delete the reset token if the user is deleted.
      .notNull(),
  },
  table => {
    return {
      tokenExpireIdx: index('IDX_token_expire').on(table.expire),
    };
  }
);
// # Transform the ORM schema into types that we can use in the rest of the file.
/**
 * The token record that is returned from the database.
 */
export type SelectToken = InferSelectModel<typeof tokens>;
/**
 * The token model which is used to insert a new record into the `tokens` table.
 */
export type InsertToken = InferInsertModel<typeof tokens>;
