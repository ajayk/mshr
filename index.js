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

const UNITS = [
  { short: "y", long: "year", ms: 365.25 * 24 * 60 * 60 * 1000 },
  { short: "w", long: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { short: "d", long: "day", ms: 24 * 60 * 60 * 1000 },
  { short: "h", long: "hour", ms: 60 * 60 * 1000 },
  { short: "m", long: "minute", ms: 60 * 1000 },
  { short: "s", long: "second", ms: 1000 },
  { short: "ms", long: "millisecond", ms: 1 },
];

// Match a number (int or float) followed by a unit label.
// Captures: (number)(unit)
const PARSE_RE =
  /(-?\d*\.?\d+)\s*(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)/gi;

/**
 * Map any supported unit alias to its millisecond value.
 */
function unitToMs(u) {
  const lower = u.toLowerCase();
  if (/^(ms|msecs?|milliseconds?)$/.test(lower)) return 1;
  if (/^(s|secs?|seconds?)$/.test(lower)) return 1000;
  if (/^(m|mins?|minutes?)$/.test(lower)) return 60_000;
  if (/^(h|hrs?|hours?)$/.test(lower)) return 3_600_000;
  if (/^(d|days?)$/.test(lower)) return 86_400_000;
  if (/^(w|weeks?)$/.test(lower)) return 604_800_000;
  if (/^(y|yrs?|years?)$/.test(lower)) return 31_557_600_000;
  return null;
}

/**
 * Parse a duration string into milliseconds.
 * Supports compound strings like "1h 30m 10s".
 */
function parse(str) {
  if (typeof str !== "string" || str.trim().length === 0) return null;

  // Handle a bare number (treated as milliseconds).
  const trimmed = str.trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);

  let total = 0;
  let matched = false;
  let negative = false;

  // Detect leading minus for the whole expression: "-1h 30m"
  let input = trimmed;
  if (input.startsWith("-")) {
    negative = true;
    input = input.slice(1);
  }

  let match;
  PARSE_RE.lastIndex = 0;
  while ((match = PARSE_RE.exec(input)) !== null) {
    const n = parseFloat(match[1]);
    const factor = unitToMs(match[2]);
    if (factor === null) return null;
    total += n * factor;
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
  const parts = [];

  let remaining = abs;
  for (const unit of UNITS) {
    if (unit.short === "ms" && parts.length > 0) break; // skip ms when bigger units present
    const count = Math.floor(remaining / unit.ms);
    if (count > 0) {
      remaining -= count * unit.ms;
      if (long) {
        parts.push(`${count} ${unit.long}${count !== 1 ? "s" : ""}`);
      } else {
        parts.push(`${count}${unit.short}`);
      }
    }
  }

  // Whole thing was < 1ms or exactly 0.
  if (parts.length === 0) {
    return long ? "0 milliseconds" : "0ms";
  }

  const result = parts.join(" ");
  return val < 0 ? `-${result}` : result;
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
