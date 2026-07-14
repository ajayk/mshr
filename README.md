# mshr

Parse and format human-readable durations. Unlike the popular `ms` package, **mshr supports compound durations** like `"1h 30m 10s"`.

Zero dependencies. ~101 lines.

## Install

```
npm install @ajaykemparaj/mshr
```

## Usage

```js
const ms = require('@ajaykemparaj/mshr');

// String → milliseconds
ms('2h')              // 7200000
ms('1h 30m 10s')      // 5410000
ms('1 day 12 hours')  // 129600000
ms('1.5h')            // 5400000
ms('-3s')             // -3000
ms('100')             // 100

// Milliseconds → string
ms(60000)             // '1m'
ms(5410000)           // '1h 30m 10s'
ms(-5400000)          // '-1h 30m'

// Long format
ms(5400000, { long: true })  // '1 hour 30 minutes'

// Named exports
ms.parse('2h')        // 7200000
ms.format(7200000)    // '2h'
```

## Supported units

| Unit         | Aliases                           |
|------------- |---------------------------------- |
| millisecond  | `ms`, `msec`, `millisecond(s)`    |
| second       | `s`, `sec`, `second(s)`           |
| minute       | `m`, `min`, `minute(s)`           |
| hour         | `h`, `hr`, `hour(s)`             |
| day          | `d`, `day(s)`                     |
| week         | `w`, `week(s)`                    |
| year         | `y`, `yr`, `year(s)`             |

## License

MIT
