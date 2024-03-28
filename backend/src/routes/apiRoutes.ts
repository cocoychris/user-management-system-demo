/**
 * @fileoverview
 * This file contains the API routes for the application.
 * The API route is the parent route for auth and user routes.
 * It also contains the configuration for the passport middleware.
 * @module
 */

import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {Strategy as GoogleStrategy, Profile} from 'passport-google-oauth20';
import {db} from '../utils/database';
import {appLogger} from '../utils/logger';
import {eq} from 'drizzle-orm';
import {AuthStrategy, SelectUser, users} from '../models/userModel';
import {Router} from 'express';
import {authRouter} from './authRoutes';
import {userRouter} from './userRoutes';
import expressSession from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import {pool} from '../utils/database';
import {env} from '../globalVars';
// Need to import the global types explicitly for the `ts-node` to recognize the
// declaration merging.
// `tsc` does not require this import.
// But it is a known issue with `ts-node`: https://github.com/TypeStrong/ts-node/issues/391
// eslint-disable-next-line
import globalTypes from '../globalTypes';
import {SEC} from '../utils/time';
import {
  createUser,
  findUserByExternalId,
  findUserById,
} from '../services/userService';
import {validatePassword} from '../services/authService';
import {assertIsError, assertIsErrorWithCode} from '../utils/error';
import {HttpError} from '../utils/HttpError';
import cookieParser from 'cookie-parser';

/**
 * The strategy for authenticating users with an email and password.
 */
const localStrategy = new LocalStrategy(
  {usernameField: 'email'},
  async (email: string, password: string, done) => {
    try {
      const user: SelectUser | undefined = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (!user) {
        done(null, false, {message: 'Account not found'});
        return;
      }
      if (user.authStrategy !== AuthStrategy.LOCAL) {
        done(null, false, {
          message: 'Try logging in with other methods',
        });
        return;
      }
      const match: boolean = await validatePassword(user, password);
      if (!match) {
        done(null, false, {message: 'Incorrect password'});
        return;
      }
      done(null, user);
    } catch (error) {
      assertIsError(error);
      appLogger.error(`Error in passport local strategy: ${error.stack}`);
      done(error);
    }
  }
);
/**
 * The strategy for authenticating users with Google.
 */
const googleStrategy = new GoogleStrategy(
  {
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${env.FRONTEND_URL}/api/v1/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile: Profile, done) => {
    try {
      // Try to find the user.
      let user: SelectUser | null = await findUserByExternalId(
        AuthStrategy.GOOGLE_OAUTH,
        profile.id
      );
      if (user) {
        done(null, user);
        return;
      }
      // Create a new user if the user is not found.
      if (!profile.emails || !profile.emails[0]) {
        // Error message for the user.
        done(
          new HttpError(
            400,
            'Bad Request: Email not found in the Google profile. Try signing up using a different account or method.'
          )
        );
        return;
      }
      try {
        user = await createUser({
          name: profile.displayName,
          email: profile.emails[0].value,
          authStrategy: AuthStrategy.GOOGLE_OAUTH,
          externalId: profile.id,
        });
      } catch (error) {
        assertIsErrorWithCode(error);
        if (error.code === '23505') {
          // Error message for the user.
          done(
            new HttpError(
              409,
              'Conflict: Email already exists. User may have signed up already using a different method.'
            )
          );
          return;
        }
        throw error;
      }
      done(null, user);
    } catch (error) {
      assertIsError(error);
      // Log the error and return a generic error message to the user.
      appLogger.error(`Error in passport google strategy: ${error.stack}`);
      done(error);
    }
  }
);

// # Configure passport
passport.use(localStrategy);
passport.use(googleStrategy);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id: number, done) => {
  try {
    const user: SelectUser | null = await findUserById(id);
    if (!user) {
      throw new Error(`User not found with ID: ${id}`);
    }
    done(null, user);
  } catch (error) {
    appLogger.error(`Error in passport deserializeUser: ${error}`);
    done(error);
  }
});

/**
 * Router for the API.
 */
export const apiRouter = Router();
const router = apiRouter;
const PgStore = connectPgSimple(expressSession);
router.use(cookieParser());
router.use(
  expressSession({
    name: 'lhtTtkR1Q0', // Using a random name to prevent fingerprinting.
    store: new PgStore({
      pool: pool, // Note that this pool is the same pool that we use for the ORM.
      ttl: env.SESSION_TTL_SEC,
    }),
    secret: env.COOKIE_SECRET,
    resave: false,
    cookie: {
      maxAge: env.COOKIE_MAX_AGE_SEC * SEC.IN_MS,
      secure: env.COOKIE_SECURE, // The cookie will only be sent over HTTPS.
      httpOnly: true, // The cookie cannot be accessed through client-side script.
      sameSite: 'strict', // The cookie will only be sent in a first-party context.
    },
    saveUninitialized: false,
  })
);
router.use(passport.session());

router.use('/auth', authRouter);
router.use('/users', userRouter);
