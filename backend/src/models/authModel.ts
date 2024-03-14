/**
 * This file contains the ORM schema for all the tables in the database using
 * the `drizzle-orm` library.
 *
 * The TypeScript types are generated from the ORM schema and are used throughout
 * the rest of the application.
 * @module
 */

import {
  pgTable,
  varchar,
  json,
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

/**
 * ORM schema of the `session` table.
 * Equivalent to the `connect-pg-simple` library's session table:
 * CREATE TABLE "session" (
 *   "sid" varchar NOT NULL COLLATE "default",
 *   "sess" json NOT NULL,
 *   "expire" timestamp(6) NOT NULL
 * )
 * WITH (OIDS=FALSE);
 * ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
 * CREATE INDEX "IDX_session_expire" ON "session" ("expire");
 */
export const sessions = pgTable(
  'session',
  {
    sid: varchar('sid').primaryKey(),
    sess: json('sess').notNull(),
    expire: timestamp('expire', {precision: 6}).notNull(),
  },
  table => {
    return {
      sessionExpireIdx: index('IDX_session_expire').on(table.expire),
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
