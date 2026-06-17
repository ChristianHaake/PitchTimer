# PitchTimer

PitchTimer is a browser-based training tool for elevator pitches and short
presentations. It is designed for students and teachers who need a simple,
local, distraction-reduced timer with notes and pitch history.

Live application: [https://pitchtimer.haak3.de](https://pitchtimer.haak3.de)

## Features

- preset pitch durations: 30, 60, 90, and 120 seconds
- 3-second preparation countdown
- start, pause, reset, progress bar, and end signal
- fullscreen presentation mode
- local notes with `.txt` export and import
- local history of the latest pitch runs
- German and English interface
- installable Progressive Web App with offline app-shell caching
- help, about, privacy, imprint, and source links

## Privacy and local processing

PitchTimer runs in the browser. It has no login, no backend, no content
database, and no upload of user-created content to the operator.

The app stores these values locally in `localStorage`:

- `pitchtimer_language`: selected interface language
- `pitchtimer_time_mode`: selected timer preset
- `pitchtimer_notes`: current notes text
- `pitchtimer_history`: versioned pitch history records

Notes can be exported as a plain text file and imported again. Imported note
files are limited to 100 KB and replace existing notes only after confirmation.

The production site is served as a static web app with security headers in
`public/_headers`.

## Development

Requirements:

- Node.js `>=20.0.0`
- npm

Setup:

```bash
npm ci
npm run dev
```

Vite prints the local development URL after startup.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the production bundle |
| `npm run preview` | Serve the production bundle locally |
| `npm run test` | Run unit tests with Vitest |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run verify` | Run typecheck, lint, tests, and build |

## Architecture

The app uses React 19, TypeScript, Vite, React Router, React Markdown, Vitest,
and `vite-plugin-pwa`.

Source is organized by responsibility:

```text
src/
  components/   timer, notes, progress, and history UI components
  hooks/        timer and history state hooks
  i18n/         typed German and English dictionaries
  utils/        audio and local history persistence helpers
content/        Markdown content pages
public/         favicon, PWA icons, and deployment headers
docs/           architecture, conformance, and review notes
```

More details are documented in
[docs/architecture.md](docs/architecture.md).

## Deployment

The production build output is `dist/`. The app expects a static host with SPA
fallback to `index.html`; the live deployment uses Cloudflare Pages.

## License

PitchTimer is licensed under GPL-3.0-only.
