/**
 * @fileoverview
 * This file is used to merge the interface generated from the ORM schema with the
 * interface defined by passport and express.
 * @module
 */

import {SelectUser} from './models/userModel';

declare global {
  namespace Express {
    // Merge the `SelectUser` interface with the `Express.User` interface from passport.
    // An empty interface is necessary to merge the two interfaces.
    // eslint-disable-next-line
    interface User extends SelectUser {}
    interface Session {
      errorMessage: string;
    }
  }
}
