# The Dartboard

A spinning dartboard that picks stocks out of the S&P 500 at random — a control
group for a quant finance project. The premise is Burton Malkiel's: a blindfolded
monkey throwing darts at the stock listings can build a portfolio that does as
well as one the experts pick. This makes that monkey clickable.

## What it does

- **Throw** — the wheel of 11 GICS sectors never stops turning. Click whenever you
  like (the board, the button, or space) and the dart flies, bites the board,
  rides it around, and the wheel coasts to a stop on one of 502 names.
  Wedge width is each sector's *share of the remaining pool*, not an equal slice,
  so every individual company has the same ~0.20% chance. Equal odds per name,
  not per sector.
- **Draw without replacement** (on by default) removes drawn names from the pool
  and reshapes the wheel as it shrinks.
- **Portfolio** — keep the picks you throw, enter an entry price and a current
  price for each, and compare the equal-weighted average return against a
  benchmark (SPY or ^GSPC) you enter the same way.

Picks and prices are saved in the browser, so a refresh doesn't lose the
portfolio. Prices are typed in by hand — there is no market data feed.

## Run it

Requires Node 20+.

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production bundle in dist/
npm run preview  # serve that bundle locally
```

`dist/` is a static folder — deployable as-is to Vercel, Netlify, or GitHub Pages.

## Files

| Path | Purpose |
| --- | --- |
| `src/Dartboard.jsx` | The whole app: ticker universe, wheel geometry, SVG rendering, portfolio table |
| `src/storage.js` | Backs `window.storage` with `localStorage` (see below) |
| `src/main.jsx` | Mounts the component |
| `src/index.css` | Tailwind import plus a few base rules |

The component was originally built as a Claude artifact, where the host page
supplies an async `window.storage` API. `src/storage.js` reimplements that
interface on top of `localStorage` so the component runs unmodified outside the
sandbox.

## Caveats

The constituent list is a snapshot of the S&P 500 with sector labels hardcoded in
`RAW` at the top of `Dartboard.jsx`. Index membership changes; decide how you'll
handle a deleted name *before* it happens, not after, or the control group stops
being a control group. Same goes for discarding a throw you don't like — the
Discard button exists, but using it reintroduces exactly the selection bias the
portfolio is meant to be free of.

Not investment advice. It's a random number generator with a nice wheel.
