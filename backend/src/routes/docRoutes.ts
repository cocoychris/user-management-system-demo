/**
 * @fileoverview
 * This file contains the router for serving the documentation.
 * There are two types of documentation:
 * - The Swagger documentation for the rest API.
 * - The TypeDoc documentation for the TypeScript code.
 * @module
 */

import express from 'express';
import {Router} from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {env} from '../globalVars';
import {pageNotFoundErrorHandler} from '../middleware';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'User Management System - API',
      version: '1.0.0',
      contact: {
        name: 'Andrash Yang',
        email: 'cocoychris@gmail.com',
      },
      description: 'This is a User Management & Authentication API.',
    },
    servers: [{url: `${env.FRONTEND_URL}/api/v1`}],
    tags: [
      {
        name: 'auth',
        description: 'Routes for authentication.',
      },
      {
        name: 'user',
        description: 'Routes for user management.',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/schema/*.ts',
    './src/controllers/*.ts',
    './src/services/*.ts',
    './src/middleware.ts',
  ],
};

/**
 * A router for serving the Swagger documentation.
 */
export const docRouter = Router();
const router = docRouter;
const swaggerSpec = swaggerJsdoc(options);
// Swagger api documentation
router.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Swagger api documentation in json format
router.get('/swagger-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
// TypeDoc documentation for this project
router.use('/typeDoc', express.static('docs'));
router.use('*', pageNotFoundErrorHandler);
