/**
 * @module mshr
 *
 * Parse human-readable duration strings into milliseconds,
 * or format milliseconds into human-readable strings.
 *
 * Supports compound durations: "1h 30m 10s" → 5410000
 *
 * @example
 *   const ms = require('mshr');
 *
 *   ms('2h')            // 7200000
 *   ms('1h 30m')        // 5400000
 *   ms('1d 12h 30m')    // 131400000
 *   ms('-3s')           // -3000
 *   ms(60000)           // '1m'
 *   ms(3661000)         // '1h 1m 1s'
 *   ms(60000, { long: true })   // '1 minute'
 *   ms(3661000, { long: true }) // '1 hour 1 minute 1 second'
 */

"use strict";

// Units used by format(), largest first. Milliseconds are handled
// separately (they only appear when no bigger unit is present).
const UNITS = [
  { short: "y", long: " year", longs: " years", ms: 365.25 * 24 * 60 * 60 * 1000 },
  { short: "w", long: " week", longs: " weeks", ms: 7 * 24 * 60 * 60 * 1000 },
  { short: "d", long: " day", longs: " days", ms: 24 * 60 * 60 * 1000 },
  { short: "h", long: " hour", longs: " hours", ms: 60 * 60 * 1000 },
  { short: "m", long: " minute", longs: " minutes", ms: 60 * 1000 },
  { short: "s", long: " second", longs: " seconds", ms: 1000 },
];

// Match a number (int or float) followed by a unit label.
// Captures: (number)(unit)
const PARSE_RE =
  /(-?\d*\.?\d+)\s*(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)/gi;

// Fast path: a single "<number><unit>" token, e.g. "2h" or "1.5 hours".
const SINGLE_RE = /^(-?\d*\.?\d+)\s*([a-zA-Z]+)$/;

// Millisecond value for every supported unit alias, keyed lowercase.
const ALIAS_MS = Object.create(null);
for (const [factor, aliases] of [
  [1, ["ms", "msec", "msecs", "millisecond", "milliseconds"]],
  [1000, ["s", "sec", "secs", "second", "seconds"]],
  [60_000, ["m", "min", "mins", "minute", "minutes"]],
  [3_600_000, ["h", "hr", "hrs", "hour", "hours"]],
  [86_400_000, ["d", "day", "days"]],
  [604_800_000, ["w", "week", "weeks"]],
  [31_557_600_000, ["y", "yr", "yrs", "year", "years"]],
]) {
  for (const alias of aliases) ALIAS_MS[alias] = factor;
}

/**
 * Parse a duration string into milliseconds.
 * Supports compound strings like "1h 30m 10s".
 */
function parse(str) {
  if (typeof str !== "string") return null;

  const trimmed = str.trim();
  if (trimmed.length === 0) return null;

  // Handle a bare number (treated as milliseconds).
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);

  // Single-token fast path; unknown units fall through to the
  // general matcher, which also handles partial matches ("5mx").
  // Only attempted when the string starts like a number ("-", ".", digit).
  const first = trimmed.charCodeAt(0);
  if (first === 45 || first === 46 || (first >= 48 && first <= 57)) {
    const single = SINGLE_RE.exec(trimmed);
    if (single) {
      const factor = ALIAS_MS[single[2].toLowerCase()];
      if (factor !== undefined) return parseFloat(single[1]) * factor;
    }
  }

  let total = 0;
  let matched = false;
  let negative = false;

  // Detect leading minus for the whole expression: "-1h 30m"
  let input = trimmed;
  if (input.charCodeAt(0) === 45 /* "-" */) {
    negative = true;
    input = input.slice(1);
  }

  let match;
  PARSE_RE.lastIndex = 0;
  while ((match = PARSE_RE.exec(input)) !== null) {
    total += parseFloat(match[1]) * ALIAS_MS[match[2].toLowerCase()];
    matched = true;
  }

  if (!matched) return null;
  return negative ? -total : total;
}

/**
 * Format milliseconds into a human-readable string.
 *
 * @param {number} val  - Duration in milliseconds.
 * @param {{ long?: boolean }} [opts]
 * @returns {string}
 */
function format(val, opts) {
  const long = opts && opts.long;
  const abs = Math.abs(val);

  // Sub-second durations are just "<n>ms".
  if (abs < 1000) {
    const count = Math.floor(abs);
    const body = long
      ? count + (count === 1 ? " millisecond" : " milliseconds")
      : count + "ms";
    return val < 0 && count > 0 ? "-" + body : body;
  }

  // abs >= 1000 guarantees at least the seconds unit contributes,
  // and the sub-second remainder is dropped.
  const parts = [];
  let remaining = abs;
  for (const unit of UNITS) {
    if (remaining < unit.ms) continue;
    const count = Math.floor(remaining / unit.ms);
    remaining -= count * unit.ms;
    parts.push(
      long ? count + (count === 1 ? unit.long : unit.longs) : count + unit.short
    );
  }

  const result = parts.join(" ");
  return val < 0 ? "-" + result : result;
}

/**
 * Main entry point.
 *
 * - String → parses to milliseconds (number).
 * - Number → formats to human-readable string.
 *
 * @param {string|number} value
 * @param {{ long?: boolean }} [opts]
 * @returns {number|string|null}
 */
function ms(value, opts) {
  if (typeof value === "string") return parse(value);
  if (typeof value === "number" && isFinite(value)) return format(value, opts);
  return null;
}

// Also expose parse/format directly for named imports.
ms.parse = parse;
ms.format = format;

module.exports = ms;
