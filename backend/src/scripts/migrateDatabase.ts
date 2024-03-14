/**
 * This file runs the migrations on the database using the `drizzle-orm` library.
 * Also, it creates the session table required for the `connect-pg-simple` library.
 *
 * Note that this file is **not** used in the application, but is used as a script
 * to run the migrations.
 *
 * ## When to run the migrations
 * - The first time you set up the application.
 * - Run the migrations when you have made changes to the database schema by
 * editing the `src/database/schema.ts` file.
 *
 * ## Usage
 * Run the migrations using the following command:
 * ```
 * npm run migrate-db
 * ```
 * Which is equivalent to running the following commands:
 * ```
 * npx drizzle-kit generate:pg
 * npx ts-node src/database/migrate.ts
 * ```
 *
 * ## Note
 * In case you have dropped all the tables and want to run the migrations
 * from scratch, you have to drop your migration progress before running
 * the migrations. You can do this by running the following command:
 * ```
 * npx drizzle-kit drop
 * ```
 * @module
 */

import {PoolClient} from 'pg';
import {db, pool} from '../utils/database';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import fs from 'fs';
import drizzleConfig from '../../drizzle.config';

async function run() {
  // Loading the SQL file for creating the session table.
  // This is required for the `connect-pg-simple` library to store the session in the database.
  // The SQL file `session-table.sql` (originally `table.sql`) is taken from the
  // `connect-pg-simple` library.
  // See: https://github.com/voxpelli/node-connect-pg-simple

  // const sessionTableSqlFile = path.resolve(
  //   __dirname,
  //   '../../session-table.sql'
  // );
  // const sql = fs.readFileSync(sessionTableSqlFile, 'utf-8');
  // // Create the session table
  // console.log('Creating session table for connect-pg-simple');
  // let client: PoolClient | null = null;
  // try {
  //   client = await pool.connect();
  //   await client.query(sql);
  //   console.log('Session table created');
  // } catch (error) {
  //   if (error instanceof Error) {
  //     console.error('Error creating session table: ' + error.message);
  //   }
  //   process.exitCode = 1;
  // } finally {
  //   if (client) {
  //     client.release();
  //   }
  // }
  // Start the migration for the rest of the tables
  console.log('Running migrations for drizzle ORM');
  try {
    await migrate(db, {migrationsFolder: drizzleConfig.out});
    // Don't forget to close the connection, otherwise the script will hang
    await pool.end();
    console.log('Migrations complete');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error running migrations: ' + error.message);
    }
    process.exitCode = 1;
  }
}
run();
