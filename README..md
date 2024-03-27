<p align="center">
  <img src="backend/assets/ums_logo.svg" width="100px" alt="User Management System Logo" />  
  <h1 align="center">User Management System</h1>
  <p align="center">Developed by Andrash Yang</p>
</p>

This project serves as the exam submission for my application to the Full Stack Web Developer position at Aha AI Company.

This project is a User Management System that allows users to register, log in, verify their email addresses, manage their profiles, retrieve statistics, and log out.

You can find a live demo of this project at the following link:

- [User Management System](https://golden-happiness.com)
- [API Documentation](https://golden-happiness.com/docs/swagger) ( [JSON format](https://golden-happiness.com/docs/swagger-json) )
- [Code Documentation](https://golden-happiness.com/docs/typedoc)

This project showcases my full-stack web development capabilities and coding style. It also highlights my ability to follow written instructions and meet specified requirements.

# Coding Style

The coding style used in this project adheres to [Google's coding style guidelines](https://google.github.io/styleguide/) for TypeScript, HTML, and CSS.

Additionally, tools such as [gts (Google TypeScript Style)](https://github.com/google/gts) and [prettier](https://prettier.io/) are utilized to enforce this coding style during the development process.

# Choice of Technologies

The primary technologies were selected based on the mandatory requirements of the exam. However, not all the suggested third-party tools were utilized, as I prefer to maintain a more detailed control over the system, including the frontend.

I made every effort to adhere to the coding style, implement the API, and establish the app workflow and user experience as closely as possible to the exam's requirements. I hope that my decision not to use all the suggested tools, in an effort to create the best user experience, will not be a deal-breaker.

# Backend

## Tech Stack

- **Database**
  - `PostgreSQL` is used as the database to store user data and sessions.
  - `DrizzleORM` is the ORM used for database operations.
  - `connect-pg-simple` is used to utilize `PostgreSQL` as the session store.
  - `pg` is the `DrizzleORM` driver and is also used by `connect-pg-simple`.
- **Authentication**
  - `passport` is the authentication middleware handling both local authentication strategy and Google OAuth authentication strategy.
- **Email Delivery**
  - `sendgrid` is used as the email delivery service.
- **Server Side Rendering**
  - `ejs` is used for server-side rendering to render simple error pages for GET method responses and for rendering verification emails.
- **Security**
  - `cors` is used for Cross-Origin Resource Sharing. This functionality is included for completeness. However, in practice, this site is configured to use a reverse proxy for backend API calls, which results in both the frontend and the backend being served from the same domain. Therefore, the CORS functionality is disabled by setting the `USE_CORS` environment variable to `false`.
  - `csrf-csrf` is used to implement CSRF protection with the Double Submit Cookie Pattern.
  - `helmet` is used to set various HTTP headers for security.
  - `express-rate-limit` is used to limit the number of requests to the server.
- **Documentation**
  - Inline `openapi` tags are used for documenting the web API and its components.
  - `swagger-jsdoc` and `swagger-ui-express` are used to generate and display API documentation from the `openapi` tags.
  - Inline `JSDoc` tags are used for documenting the code.
  - `typedoc` is used to generate the code documentation.
- **Request Validation**
  - `zod` is used for validating the request body and query parameters.
- **Logging**
  - `winston` is used for logging server events. It logs all incoming requests, errors, and also catches all unhandled exceptions.

## Folder Structure

The backend is organized into the following directories:

- `assets`: This directory contains static assets such as images and logos.
- `src`: This directory contains the backend's source code, which is further divided into:
  - `controllers`: This directory contains the controllers (endpoints) that handle incoming requests and implement the main business logic for their respective routes.
  - `middlewares`: This directory contains middleware for common functionalities shared across various routes.
  - `models`: This directory contains models for the database tables, created using `DrizzleORM`. It also provides inferred types for these models.
  - `routes`: This directory contains the `Docs` and `API` routes for the application. For additional details, please refer to the [Routes](#routes) section below.
  - `schemas`: This directory contains schemas created using `zod` for request validation. It also provides inferred types for these schemas.
  - `scripts`: This directory contains scripts for database migration and resetting the database.
  - `services`: This directory contains services for accessing resources and performing business logic.
  - `utils`: This directory contains utility functions. Most third-party tools are configured and initialized here. It also contains some custom utility functions.
- `views`: This directory contains EJS templates for rendering server-side pages.

## Routes

There are two main routes in the backend:

- **Docs Route**: This static route serves both the `typeDoc` and `swagger` documentation. Users are not required to authenticate to access this route. For more information, please refer to the [`docRoutes.ts` file](backend/src/routes/docRoutes.ts).
- **API Route**: This route serves the web APIs and includes session & authentication functions. Consequently, the `api` route cannot be accessed without proper authentication. For more details, refer to the [`apiRoutes.ts` file](backend/src/routes/apiRoutes.ts). This route comprises two sub-routes:
  - **Auth API Route**: This route enables client-side applications to authenticate users, including functionalities like login, logout, and email validation. For more information, refer to the [`authRoutes.ts` file](backend/src/routes/authRoutes.ts).
  - **User API Route**: This route allows client-side applications to manage users. It includes features like creating new users (also known as registration or sign-up), fetching user profiles, editing user profiles, listing all users and their profiles, and fetching user statistics. For more details, refer to the [`userRoutes.ts` file](backend/src/routes/userRoutes.ts).

# Frontend

While I understand that this examination primarily focuses on backend development, I believe in delivering my best in every aspect of a project. As a developer who takes pride in his work, I strive to ensure that even the frontend meets a certain aesthetic standard. I hope that this commitment to quality is evident in the frontend of this project.

## Tech Stack

- **Frontend Framework**
  - `React` is used to build the frontend.
  - `React Router` is used for routing within the frontend.
- **UI Library**
  - `Material-UI` is used for the UI components. This is to reduce the time spent on designing the UI and to ensure a consistent look and feel across the application.
- **API Client**
- `openapi-generator-cli` is used to generate the API client from the `openapi` specifications. These specifications are defined inline in the backend using `@openapi` tags. The `swagger-jsdoc` and `swagger-ui-express` packages translate these tags into JSON format specifications. The generated API client can be found in the `src/openapi` directory.
- **Input Validation**
  - `zod` is used for validating the input fields.
- **Bundler**
  - `vite` is used for bundling the frontend code.

# Thank You

Thank you for taking the time to review my code and documentation. I don't often have the opportunity to have my work peer-reviewed, so I'm genuinely interested and eager to hear your feedback. I'm confident that your insights will help me improve my coding skills and facilitate future collaborations. I look forward to potentially working with you and your team. Thanks again.

Andrash Yang 2024