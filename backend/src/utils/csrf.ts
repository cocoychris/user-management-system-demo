/**
 * @fileoverview
 * This file configures the CSRF protection for the application.
 * @module
 */
import {env} from '../globalVars';
import {doubleCsrf} from 'csrf-csrf';

/**
 * Double CSRF protection options
 * @openapi
 * components:
 *   responses:
 *     DoubleCsrfProtection403Response:
 *       description: Forbidden. Invalid CSRF token.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Invalid CSRF token
 *             required:
 *               - message
 *   parameters:
 *     CSRFTokenHeader:
 *       name: x-csrf-token
 *       in: header
 *       description: The CSRF token. It must be the same as the one in the cookie.
 *       required: true
 *       schema:
 *         type: string
 *         example: 96a87aac7682fa382d86d81afeb87e9fc32d457bc5f8bb2b9c3e3f547bc20b90b8bb7d5fd9a3a97b3323a79a06d3cf169a8a25449935dd71750dc4722a0f4b77
 */
export const {
  generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  cookieOptions: {
    secure: env.COOKIE_SECURE,
  },
  cookieName: env.COOKIE_SECURE ? undefined : 'x-csrf-token', // The default cookie name "__Host-psifi.x-csrf-token" can only be set on secure cookies.
  getTokenFromRequest: req => {
    return req.headers['x-csrf-token'];
  },
});
