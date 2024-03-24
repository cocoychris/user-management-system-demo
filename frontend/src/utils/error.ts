/**
 * @fileoverview
 * This file contains utility functions for error handling.
 * @module
 */

import {ZodError} from 'zod';

/**
 * Asserts that the given value is an instance of specified error class.
 * @param value The value to check.
 * @param errorClass The expected error class, should be a subclass of `Error`.
 *     If not provided, `Error` is used.
 */
export function assertIsError<T extends Error = Error>(
  value: unknown,
  // Using `any` here because a constructor with any arguments should be allowed,
  // using `unknown` here will prevent any constructor from being passed.
  // eslint-disable-next-line
  errorClass?: new (...args: any[]) => T
): asserts value is T {
  if (value instanceof (errorClass || Error)) {
    return;
  }
  let typeName: string;
  let stringValue = '';
  if (value === null || value === undefined) {
    typeName = String(value);
  } else if (typeof value === 'object') {
    typeName = value.constructor.name;
    stringValue = JSON.stringify(value);
  } else {
    typeName = typeof value;
    stringValue = typeName === 'string' ? `"${value}"` : String(value);
  }
  throw new Error(
    `Expected an error instance of ${errorClass?.name}, but got ${typeName}${
      stringValue ? `: ${stringValue}` : ''
    }`
  );
}
/**
 * Converts a Zod error to a human-readable message.
 */
export function zodErrorToMessage(error: ZodError) {
  return error.errors
    .map(info => {
      return `${info.path.join('.')}: ${info.message}`;
    })
    .join('\n');
}

interface ErrorWithCode extends Error {
  code: string | number;
}
/**
 * Asserts that the given value is an instance of `Error` and has a `code` property.
 */
export function assertIsErrorWithCode(
  error: unknown
): asserts error is ErrorWithCode {
  assertIsError(error);
  if (!['string', 'number'].includes(typeof (error as ErrorWithCode).code)) {
    throw new Error(`'code' property is missing in the error: ${error}`);
  }
}
