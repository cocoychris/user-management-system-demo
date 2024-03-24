/**
 * @fileoverview
 * This file contains the logger for the application.
 * The logger is used to log the application's activities to the console and to files.
 * @module
 */
import {format, createLogger, transports} from 'winston';
import {env, NodeEnv} from '../globalVars';

const DEFAULT_FORMAT = format.combine(
  format.timestamp({
    format: 'MM-DD HH:mm:ss',
  }),
  format.errors({stack: true}),
  format.json()
);
const DEFAULT_FILE_OPTIONS = {
  dirname: 'logs',
  maxsize: 5 * 1024 * 1024, // 5MB
  maxFiles: 10,
};
/**
 * A logger for the application.
 */
export const appLogger = createLogger({
  defaultMeta: {module: 'app'},
  level: env.NODE_ENV === NodeEnv.PROD ? 'info' : 'debug',
  format: DEFAULT_FORMAT,
  transports: [
    // - Write all logs with importance level of `error` or less to `error.log`
    new transports.File(
      Object.assign(
        {filename: 'error.log', level: 'error'},
        DEFAULT_FILE_OPTIONS
      )
    ),
    // - Write all logs with importance level of `info` or less to `combined.log`
    new transports.File(
      Object.assign({filename: 'combined.log'}, DEFAULT_FILE_OPTIONS)
    ),
  ],
  exceptionHandlers: [
    new transports.File(
      Object.assign({filename: 'exceptions.log'}, DEFAULT_FILE_OPTIONS)
    ),
  ],
});
/**
 * A logger for logging the request details.
 */
export const reqLogger = createLogger({
  level: env.NODE_ENV === NodeEnv.PROD ? 'info' : 'debug',
  format: DEFAULT_FORMAT,
  transports: [
    new transports.File(
      Object.assign({filename: 'requests.log'}, DEFAULT_FILE_OPTIONS)
    ),
  ],
});

// If we're not in production then log to the console.
if (env.NODE_ENV !== NodeEnv.PROD) {
  appLogger.add(
    new transports.Console({
      format: format.combine(
        format.colorize({
          all: true,
          colors: {info: 'blue', error: 'red', warn: 'yellow'},
        }),
        format.printf(
          info =>
            `[${info.timestamp}] ${info.message} ${
              info.stack ? info.stack : ''
            }`
        )
      ),
    })
  );
}
