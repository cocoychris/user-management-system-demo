import type {Config} from 'drizzle-kit';
import {env} from './src/globalVars';

export default {
  schema: './src/models/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: env.POSTGRES_URI,
  },
} satisfies Config;
