/**
 * @fileoverview
 * ORM schema of the relations between different tables.
 * This file is created separately from the other ORM schema files to avoid circular imports.
 * @module
 */

import {relations} from 'drizzle-orm';
import {users} from './userModel';
import {tokens} from './tokenModel';
/**
 * ORM schema of the relations between the `users` and `tokens` tables.
 */
export const userRelations = relations(users, ({many}) => ({
  tokens: many(tokens),
}));
