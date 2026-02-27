const ms = require("./index");

let passed = 0;
let failed = 0;

function eq(actual, expected, label) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${label}\n  expected: ${expected}\n  actual:   ${actual}`);
  }
}

// ── Parsing: single units ──────────────────────────────────────────

eq(ms("500ms"), 500, "parse 500ms");
eq(ms("1s"), 1000, "parse 1s");
eq(ms("1 s"), 1000, "parse 1 s (space)");
eq(ms("5sec"), 5000, "parse 5sec");
eq(ms("2 seconds"), 2000, "parse 2 seconds");
eq(ms("1m"), 60000, "parse 1m");
eq(ms("2 minutes"), 120000, "parse 2 minutes");
eq(ms("1h"), 3600000, "parse 1h");
eq(ms("2 hours"), 7200000, "parse 2 hours");
eq(ms("1d"), 86400000, "parse 1d");
eq(ms("2 days"), 172800000, "parse 2 days");
eq(ms("1w"), 604800000, "parse 1w");
eq(ms("1y"), 31557600000, "parse 1y");

// ── Parsing: fractional ────────────────────────────────────────────

eq(ms("1.5h"), 5400000, "parse 1.5h");
eq(ms("0.5s"), 500, "parse 0.5s");

// ── Parsing: compound durations ────────────────────────────────────

eq(ms("1h 30m"), 5400000, "parse 1h 30m");
eq(ms("1d 12h 30m"), 131400000, "parse 1d 12h 30m");
eq(ms("1h 30m 10s"), 5410000, "parse 1h 30m 10s");
eq(ms("2d 3h 4m 5s"), 183845000, "parse 2d 3h 4m 5s");
eq(ms("1 hour 30 minutes"), 5400000, "parse 1 hour 30 minutes");

// ── Parsing: negative ──────────────────────────────────────────────

eq(ms("-3s"), -3000, "parse -3s");
eq(ms("-1h 30m"), -5400000, "parse -1h 30m");

// ── Parsing: bare numbers ──────────────────────────────────────────

eq(ms("100"), 100, "parse bare number 100");
eq(ms("-50"), -50, "parse bare negative number");

// ── Parsing: edge cases ────────────────────────────────────────────

eq(ms(""), null, "parse empty string");
eq(ms("foo"), null, "parse invalid string");
eq(ms(undefined), null, "parse undefined");
eq(ms(null), null, "parse null");

// ── Formatting: short ──────────────────────────────────────────────

eq(ms(500), "500ms", "format 500 → 500ms");
eq(ms(1000), "1s", "format 1000 → 1s");
eq(ms(60000), "1m", "format 60000 → 1m");
eq(ms(3600000), "1h", "format 3600000 → 1h");
eq(ms(86400000), "1d", "format 86400000 → 1d");
eq(ms(604800000), "1w", "format 604800000 → 1w");

// ── Formatting: compound ───────────────────────────────────────────

eq(ms(5400000), "1h 30m", "format 5400000 → 1h 30m");
eq(ms(5410000), "1h 30m 10s", "format 5410000 → 1h 30m 10s");
eq(ms(90061000), "1d 1h 1m 1s", "format 90061000 → 1d 1h 1m 1s");

// ── Formatting: long ───────────────────────────────────────────────

eq(ms(1000, { long: true }), "1 second", "format long singular");
eq(ms(2000, { long: true }), "2 seconds", "format long plural");
eq(ms(60000, { long: true }), "1 minute", "format long 1 minute");
eq(ms(5400000, { long: true }), "1 hour 30 minutes", "format long compound");
eq(ms(90061000, { long: true }), "1 day 1 hour 1 minute 1 second", "format long compound full");

// ── Formatting: negative ───────────────────────────────────────────

eq(ms(-3000), "-3s", "format negative");
eq(ms(-5400000), "-1h 30m", "format negative compound");

// ── Formatting: zero ───────────────────────────────────────────────

eq(ms(0), "0ms", "format zero short");
eq(ms(0, { long: true }), "0 milliseconds", "format zero long");

// ── Named exports ──────────────────────────────────────────────────

eq(ms.parse("2h"), 7200000, "ms.parse works");
eq(ms.format(7200000), "2h", "ms.format works");

// ── Summary ────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
