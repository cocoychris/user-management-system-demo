/**
 * Time constants for converting between different time units.
 * @module
 */

export const SEC = {
  IN_MS: 1000,
};

export const MIN = {
  IN_SEC: 60,
  IN_MS: 60000,
};

export const HOUR = {
  IN_MIN: 60,
  IN_SEC: 3600,
  IN_MS: 3600000,
};

export const DAY = {
  IN_HOUR: 24,
  IN_MIN: 1440,
  IN_SEC: 86400,
  IN_MS: 86400000,
};

export const WEEK = {
  IN_DAY: 7,
  IN_HOUR: 168,
  IN_MIN: 10080,
  IN_SEC: 604800,
  IN_MS: 604800000,
};

export const MONTH28 = {
  IN_DAY: 28,
  IN_HOUR: 672,
  IN_MIN: 40320,
  IN_SEC: 2419200,
  IN_MS: 2419200000,
};

export const MONTH29 = {
  IN_DAY: 29,
  IN_HOUR: 696,
  IN_MIN: 41760,
  IN_SEC: 2505600,
  IN_MS: 2505600000,
};

export const MONTH30 = {
  IN_DAY: 30,
  IN_HOUR: 720,
  IN_MIN: 43200,
  IN_SEC: 2592000,
  IN_MS: 2592000000,
};

export const MONTH31 = {
  IN_DAY: 31,
  IN_HOUR: 744,
  IN_MIN: 44640,
  IN_SEC: 2678400,
  IN_MS: 2678400000,
};

export const YEAR = {
  IN_DAY: 365,
  IN_HOUR: 8760,
  IN_MIN: 525600,
  IN_SEC: 31536000,
  IN_MS: 31536000000,
};
