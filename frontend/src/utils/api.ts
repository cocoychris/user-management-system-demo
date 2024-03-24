import {AnyZodObject, z} from 'zod';
import {HttpError} from './HttpError';
import {AuthApi, UserApi} from '../openapi';

/**
 * TODO: Maybe remove this function before deploying to production
 * Fetch data from an API and parse it using a schema
*/
export async function fetchApi({
  apiUrl,
  responseSchema,
  maxRetries = 2,
  retryInterval = 1000,
  method = 'GET',
}: {
  apiUrl: string;
  responseSchema: AnyZodObject;
  maxRetries?: number;
  retryInterval?: number;
  method?: string;
}): Promise<z.infer<typeof responseSchema>> {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(apiUrl, {
        method,
        credentials: 'include',
      });
      if (response.ok) {
        return responseSchema.parse(await response.json());
      }
      const data = await response.json();
      throw new HttpError(response.status, data.message || response.statusText);
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      await delay(retryInterval);
    }
  }
  // Should never reach here
  throw new Error('Failed to fetch data');
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const authApi = new AuthApi();

export const userApi = new UserApi();
