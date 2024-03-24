/**
 * @fileoverview
 * This file contains the Drizzle ORM schema of the `session` table.
 * @module
 */

import {pgTable, varchar, json, timestamp, index} from 'drizzle-orm/pg-core';
/**
 * The ORM schema of the `session` table.
 *
 * This table is used by the `connect-pg-simple` library to store the session data.
 * Creating this table manually is required for the library to work.
 * This is the Drizzle ORM version, translated from the SQL schema provided by the library:
 * ```sql
 * CREATE TABLE "session" (
 *   "sid" varchar NOT NULL COLLATE "default",
 *   "sess" json NOT NULL,
 *   "expire" timestamp(6) NOT NULL
 * )
 * WITH (OIDS=FALSE);
 * ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
 * CREATE INDEX "IDX_session_expire" ON "session" ("expire");
 * ```
 */
export const sessions = pgTable(
  'session', // not using the `sessions` name to keep it compatible with the `connect-pg-simple` library.
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
