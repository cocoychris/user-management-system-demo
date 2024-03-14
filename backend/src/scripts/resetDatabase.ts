/**
 * This file runs the reset script for the database using pg library.
 * This file is not used in the application, but is used as a script to reset the database.
 *
 * ## CAUTION
 * This will drop all the tables of the database. Only use this script
 * when you want to reset the database to the initial state and run the migrations from
 * scratch.
 *
 * ## Note
 * After running this script, you have to run the following command to reset the
 * migration progress of the drizzle-kit before running the migrations:
 * ```
 * npx drizzle-kit drop
 * ```
 * @module
 */

import {PoolClient} from 'pg';
import {pool} from '../utils/database';

async function run() {
  // Dropping all the tables
  console.log('Resetting the database...');
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('Database reset');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error resetting the database: ' + error.message);
    }
    process.exitCode = 1;
  } finally {
    if (client) {
      client.release();
    }
  }
}
run();
