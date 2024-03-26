/**
 * @fileoverview
 * The entry point of the application.
 * @module
 */

import {appLogger} from './utils/logger';
import express, {Express} from 'express';
import {env} from './globalVars';
import {docRouter} from './routes/docRoutes';
import {apiRouter} from './routes/apiRoutes';
import {
  internalServerErrorHandler,
  jsonSyntaxErrorHandler,
  notFoundErrorHandler,
  requestLogger,
} from './middleware';
import {tokenGcStart} from './services/tokenService';
import sgMail from '@sendgrid/mail';
import {HOUR, MIN} from './utils/time';
import cors, {CorsOptions} from 'cors';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';

// Set up token (email verification token) garbage collector
tokenGcStart(1 * HOUR.IN_MS);
// Set up SendGrid
sgMail.setApiKey(env.SENDGRID_API_KEY);
// Set up CORS
const corsOptions: CorsOptions = {
  origin: env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};
// Set up Rate limiter
const limiter = rateLimit({
  windowMs: 10 * MIN.IN_MS,
  limit: 150, // Limit each IP to ? requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Too many requests, please try again later.',
  },
});

// Create the express app
const app: Express = express();
app.set('view engine', 'ejs');
if (env.USE_CORS) {
  app.use(cors(corsOptions));
}
app.use(helmet());
app.use(limiter);
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(jsonSyntaxErrorHandler);
app.use(requestLogger);

// Serve the static assets
app.use('/backend/assets', express.static('assets'));

// Routes for API
// This route is protected by the double CSRF protection middleware as it is
// the only route that uses sessions & cookies.
app.use('/api/v1', apiRouter);

// Routes for documentation
// This route is just for serving the static documentation.
// Therefore no extra protection is applied.
app.use('/docs', docRouter);

// 404 Error handler
app.use(notFoundErrorHandler);
// 500 Error handler
app.use(internalServerErrorHandler);

// Start the server
appLogger.info('Starting the server...');
app
  .listen(env.PORT, () => {
    appLogger.info(`Server is running at http://localhost:${env.PORT}`);
  })
  .on('error', error => {
    appLogger.error(error);
    throw error;
  });
