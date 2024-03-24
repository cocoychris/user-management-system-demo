/**
 * @fileoverview
 * This file contains all the general purpose middleware functions that are used
 * in multiple routes.
 *
 * The middleware functions are used for request parsing, condition checking,
 * error handling and more.
 * @module
 *
 * @openapi
 * components:
 *   schemas:
 *     ErrorSchema:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The error message.
 *           example: '4xx error message here'
 *       required:
 *         - message
 */

import {Request, Response, NextFunction} from 'express';
import {AnyZodObject, ZodError} from 'zod';
import {assertIsError, zodErrorToMessage} from './utils/error';
import {appLogger, reqLogger} from './utils/logger';
import {NodeEnv, env} from './globalVars';

/**
 * Validates and parses the request body, query, and params using
 * the given schema.
 * Will send 400 (Bad Request) if the request does not match the schema.
 * @param schema Schema for validating the request body, query, and params.
 * @openapi
 * components:
 *   responses:
 *     ParseRequest400Response:
 *       description: Bad Request. The request does not match the schema.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 */
export function parseRequest(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const {body, query, params} = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = body;
      req.query = query;
      req.params = params;
      next();
    } catch (error: unknown) {
      assertIsError(error, ZodError);
      const message =
        'Bad Request: The request does not match the schema.\n' +
        zodErrorToMessage(error);
      appLogger.warn(message);
      res.status(400).json({
        message,
      });
    }
  };
}

/**
 * Ensures that the user's email is verified or not based on the given parameter.
 * Will send 403 (Forbidden) if the user's email is not verified.
 * Will send 409 (Conflict) if the user's email is already verified.
 * @openapi
 * components:
 *   responses:
 *     EnsureEmailVerified403Response:
 *       description: Forbidden. The user's email is not verified.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 *     EnsureEmailVerified409Response:
 *       description: Conflict. The user's email is already verified.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 */
export function ensureEmailVerified(shoudBeVerified: boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new Error('User not found');
    }
    if (shoudBeVerified && !req.user.isEmailVerified) {
      appLogger.warn(`Forbidden: Email not verified: ${req.user.email}`);
      res.status(403).json({message: 'Forbidden: Email not verified'});
      return;
    }
    if (!shoudBeVerified && req.user.isEmailVerified) {
      appLogger.warn(`Conflict: Email already verified: ${req.user.email}`);
      res.status(409).json({message: 'Conflict: Email already verified'});
      return;
    }
    next();
  };
}
/**
 * Ensures that the user is authenticated or not based on the given parameter.
 * Will send 401 (Unauthorized) if the user is not authenticated.
 * Will send 403 (Forbidden) if the user is authenticated.
 * @openapi
 * components:
 *   responses:
 *     EnsureAuthenticated401Response:
 *       description: Unauthorized. The user is not logged in.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 *     EnsureAuthenticated403Response:
 *       description: Forbidden. Action not allowed when logged in.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 */
export function ensureAuthenticated(shoudBeAuthenticated: boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (shoudBeAuthenticated && !req.isAuthenticated()) {
      const message = 'Unauthorized: Not logged in';
      appLogger.warn(message);
      res.status(401).json({message});
      return;
    }
    if (!shoudBeAuthenticated && req.isAuthenticated()) {
      const message = 'Forbidden: Action only allowed when not logged in';
      appLogger.warn(message);
      res.status(403).json({message});
      return;
    }
    next();
  };
}

/**
 * Ensures that the user's authentication strategy is the given strategy.
 * Will send 403 (Forbidden) if the user's authentication strategy is not the given strategy.
 * @param strategy The authentication strategy to check for.
 * @openapi
 * components:
 *   responses:
 *     EnsureAuthStrategy403Response:
 *       description: Forbidden. Action not allowed for the current authentication strategy.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 */
export function ensureAuthStrategy(strategy: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new Error('User not found');
    }
    if (req.user.authStrategy !== strategy) {
      const message = `Forbidden: Action not allowed for the current authentication strategy (${req.user.authStrategy})`;
      appLogger.warn(message);
      res.status(403).json({
        message,
      });
      return;
    }
    next();
  };
}

/**
 * Logs the request method, URL, headers, and body to the
 * console and the log file.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  appLogger.info(`Request: ${req.method} ${req.originalUrl}`);
  reqLogger.info(
    `Request: ${JSON.stringify(
      {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body,
      },
      null,
      2
    )}`
  );
  next();
}
/**
 * A generic 404 handler that logs the error and sends 404 (Not Found) in JSON format
 * @openapi
 * components:
 *   responses:
 *     NotFoundResponse:
 *       description: Not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorSchema'
 */
export function notFoundErrorHandler(req: Request, res: Response) {
  appLogger.warn(`Not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({message: 'Not found'});
}
/**
 * A generic 404 handler that logs the error and sends 404 (Not Found) in HTML format
 * @openapi
 * components:
 *   responses:
 *     PageNotFoundHtmlResponse:
 *       description: Responds with a webpage that says "Page not found" and a link for returning to the home page.
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *             example: '<!DOCTYPE html> ...'
 */
export function pageNotFoundErrorHandler(req: Request, res: Response) {
  appLogger.warn(`Page not found: ${req.method} ${req.originalUrl}`);
  res.status(404).render('message', {
    type: 'error',
    title: 'Error 404: Page not found',
    summary: 'The page you are looking for does not exist.',
    details: null,
    buttonText: 'Go to Home Page',
    buttonUrl: env.FRONTEND_URL,
  });
}
/**
 * A generic error handler that logs the error and sends 500
 * (Internal Server error) in JSON format.
 * @openapi
 * components:
 *   responses:
 *     InternalServerErrorResponse:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Internal server error
 *                 example: 'Internal server error'
 *             required:
 *               - message
 */
export function internalServerErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  // `next` parameter is required for express to recognize this as an error
  // handling middleware.
  // eslint-disable-next-line
  next: NextFunction
): void {
  appLogger.error(error.stack);
  if (env.NODE_ENV === NodeEnv.DEV) {
    res.status(500).json({message: error.message});
    return;
  }
  res.status(500).json({message: 'Internal server error'});
}
/**
 * A generic error handler that logs the error and sends 500
 * (Internal Server error) in HTML format.
 * @openapi
 * components:
 *   responses:
 *     InternalServerErrorHtmlResponse:
 *       description: Responds with a webpage that says "Internal server error" and a link for returning to the home page.
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *             example: '<!DOCTYPE html> ...'
 */
export function internalServerErrorHtmlHandler(
  error: Error,
  req: Request,
  res: Response,
  // `next` parameter is required for express to recognize this as an error
  // handling middleware.
  // eslint-disable-next-line
  next: NextFunction
): void {
  appLogger.error(error.stack);
  res.status(500).render('message', {
    type: 'error',
    title: 'Error 500: Internal server error',
    summary: 'An internal server error occurred.',
    details: env.NODE_ENV === NodeEnv.DEV ? error.message : null,
    buttonText: 'Go to Home Page',
    buttonUrl: env.FRONTEND_URL,
  });
}
/**
 * Catchs the SyntaxError thrown by `express.json()` and sends
 * 400 (Bad Request) in JSON format.
 */
export function jsonSyntaxErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof SyntaxError) {
    appLogger.warn(`Invalid JSON: ${error.message}`);
    res.status(400).json({message: `Invalid JSON: ${error.message}`});
    return;
  }
  next(error);
}
/**
 * Wraps an async request handler with a catch block to catch any errors
 */
export function asyncCatch(
  middleware: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await middleware(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
