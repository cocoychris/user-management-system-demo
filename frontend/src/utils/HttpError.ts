/**
 * TODO: Maybe remove this function before deploying to production
 * Custom error class for HTTP errors that includes an HTTP status code.
 */
export class HttpError extends Error {
  constructor(
    /** HTTP status code */
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}
