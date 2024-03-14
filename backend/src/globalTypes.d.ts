/**
 * This file is used to merge the interface generated from the ORM schema with the
 * interface defined by passport and express.
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
// Adding custom properties to the express session.
// This is used for accessing the passport authentication failure message.
// TODO: Might not need this anymore. Remove before production.
declare module 'express-session' {
  interface SessionData {
    messages: string[];
  }
}
