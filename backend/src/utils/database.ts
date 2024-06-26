/**
 * @fileoverview
 * This file contains the database connection and ORM instance.
 *
 * Provides two ways to interact with the database:
 * 1. The `pg` library for raw SQL queries.
 * 2. The `drizzle-orm` library for ORM operations.
 * @module
 */

import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import {env} from '../globalVars';
import * as userModel from '../models/userModel';
import * as sessionModel from '../models/sessionModel';
import * as tokenModel from '../models/tokenModel';
import * as relationsModel from '../models/relationsModel';
/**
 * The database connection pool provided by the `pg` library.
 */
export const pool = new Pool({
  connectionString: env.POSTGRES_URI,
});
/**
 * The database ORM instance provided by the `drizzle-orm` library.
 */
export const db = drizzle(pool, {
  schema: {...userModel, ...sessionModel, ...tokenModel, ...relationsModel},
});
