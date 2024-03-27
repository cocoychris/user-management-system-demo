# About the Backend
This document provides an overview of the backend codebase for the User Management System, developed by Andrash. The aim is to help you understand the structure of the backend codebase.

```
Please note that this file is designed for `typedoc` documentation and is intended to be displayed on the `typedoc` generated documentation website. If you're viewing this file in a text editor, I recommend opening it in a browser for a complete documentation experience.
```
## Getting Started
I suggest beginning with the [`index.ts` file](modules/index.html), the entry point to the backend codebase. Following that, it would be beneficial to explore the `routes` directory.

## Routes
The backend primarily consists of two routes:
- **Docs Route**: This route provides access to the `typeDoc` documentation (which you're currently reading) and the [`swagger` documentation](/docs/swagger). The latter offers detailed specifications of all public web APIs exposed by the backend. The `docs` route is accessible without authentication. For more information, refer to the [`docRoutes.ts` file](modules/routes_docRoutes.html).
- **API Route**: This route serves the web APIs and includes session & authentication functions. Consequently, the `api` route cannot be accessed without proper authentication. For more details, refer to the [`apiRoutes.ts` file](modules/routes_apiRoutes.html). This route comprises two sub-routes:
    - **Auth API Route**: This route enables client-side applications to authenticate users, including functionalities like login, logout, and email validation. For more information, refer to the [`authRoutes.ts` file](modules/routes_authRoutes.html).
    - **User API Route**: This route allows client-side applications to manage users. It includes features like creating new users (also known as registration or sign-up), fetching user profiles, editing user profiles, listing all users and their profiles, and fetching user statistics. For more details, refer to the [`userRoutes.ts` file](modules/routes_userRoutes.html).

## Authentication
This project uses the `passport` library for authentication and supports two authentication strategies:
- **Local Authentication Strategy**: This strategy registers users in the local database and authenticates them using their `email` and `password`.
- **Google OAuth Strategy**: This strategy authenticates users through Google OAuth, allowing users to connect and log in with their Google accounts.

You can find the configurations for `passport` and these authentication strategies in the [`apiRoutes.ts` file](modules/routes_apiRoutes.html).

## Database
This project utilizes a PostgreSQL database for the following purposes:
- **Storing session data**, in conjunction with the `connect-pg-simple` library.
- **Storing user and token data**, in conjunction with `Drizzle ORM`.

You can find the configurations for the database and `Drizzle ORM` in the [`utils/database.ts` file](modules/utils_database.html).

## Schemas
This project utilizes two types of schemas:

- **Database Schemas**: These are used to define all tables and columns in the database. I refer to them as `models` to avoid confusion with the `Request Payload Schemas`. These models are defined using the Drizzle ORM with TypeScript. Unlike Prisma, Drizzle ORM does not have its own schema notation language. You can find these models in the `models` directory.

- **Request Payload Schemas**: These are used to validate the payload of incoming API requests. I construct these schemas using the `zod` library. You can find these schemas in the `schema` directory.

Both `Drizzle ORM` and `zod` offer functionality to transform (or infer) schemas into TypeScript types. These inferred types are used throughout the rest of the project.

## Other Files
The majority of the backend files in this project are documented with `@fileoverview` and `@module` tags, which provide a basic introduction to each file. If you're unsure about the purpose of a file, simply refer to its embedded documentation.