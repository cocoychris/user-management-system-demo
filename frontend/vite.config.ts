import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
dotenv.config();
const env = process.env;
if (!env.API_SERVER_URL) {
  throw new Error('API_SERVER_URL is not set in the .env file');
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': env.API_SERVER_URL,
      '/doc': env.API_SERVER_URL,
      '/backend': env.API_SERVER_URL,
    },
  },
});
