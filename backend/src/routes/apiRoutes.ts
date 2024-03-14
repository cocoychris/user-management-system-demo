import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
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
import {getUser} from '../services/userService';
import {validatePassword} from '../services/authService';

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
      appLogger.error(`Error in passport local strategy: ${error}`);
      done(error);
    }
  }
);
// # Configure passport to use the local strategy
passport.use(localStrategy);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id: number, done) => {
  try {
    const user: SelectUser = await getUser(id);
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
router.use(
  expressSession({
    store: new PgStore({
      pool: pool, // Note that this pool is the same pool that we use for the ORM.
      ttl: env.SESSION_TTL_SEC,
    }),
    secret: env.COOKIE_SECRET,
    resave: false,
    cookie: {maxAge: env.COOKIE_MAX_AGE_SEC * SEC.IN_MS},
    saveUninitialized: false,
  })
);
router.use(passport.session());
router.use('/auth', authRouter);
router.use('/users', userRouter);
