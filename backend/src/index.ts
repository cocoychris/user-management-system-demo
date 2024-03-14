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
import {HOUR} from './utils/time';

// Initialize modules
tokenGcStart(1 * HOUR.IN_MS);
sgMail.setApiKey(env.SENDGRID_API_KEY);

// Create the express app
const app: Express = express();
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(jsonSyntaxErrorHandler);
app.use(requestLogger);
// Routes for API
app.use('/api/v1', apiRouter);
// Routes for documentation
app.use('/docs', docRouter);
// 404 handler
app.use(notFoundErrorHandler);
// Error handler
app.use(internalServerErrorHandler);

// Start the server
app.listen(env.PORT, () => {
  appLogger.info(`Server is running at http://localhost:${env.PORT}`);
});
