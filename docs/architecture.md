# Architecture

## Product

- App: `PitchTimer`
- Live URL: `https://pitchtimer.haak3.de`
- Repository: `https://github.com/ChristianHaake/PitchTimer`
- Intended users: Schülerinnen und Schüler, Lehrkräfte
- Purpose: local practice tool for short presentations and elevator pitches.

## Stack

- React 19 with TypeScript and strict checking
- Vite for development and production builds
- React Router for public routes
- React Markdown for bundled Markdown content pages
- Tiptap for rich-text pitch notes
- `vite-plugin-pwa` for installability and offline app-shell caching
- Vitest for focused unit tests

Browser-native APIs are used for fullscreen, file import/export, local
persistence, audio output, screen wake lock, and PWA runtime behavior.

## Source Structure

```text
src/
  components/   timer, notes, progress, and history UI components
  hooks/        timer and history state hooks
  i18n/         typed German and English dictionaries
  utils/        audio and persistence helpers
content/        bundled Markdown pages
public/         icons, deployment headers, and static assets
```

## State

In-memory state is owned by React hooks:

- `useTimer`: selected duration, remaining time, preparation countdown, running state
- `useHistory`: pitch history records
- `NotesField`: current title, rich-text notes, estimated reading time, prompter text size
- `LanguageProvider`: selected language

Timer countdowns are deadline-based. The visible remaining time is calculated
from the current time and the stored deadline instead of assuming that
`setInterval` fires exactly once per second.

Persisted state uses namespaced `localStorage` keys:

| Key | Schema | Purpose | Reset behavior |
| --- | --- | --- | --- |
| `pitchtimer_language` | string: `de` or `en` | selected interface language | browser site-data deletion |
| `pitchtimer_time_mode` | supported number preset | selected timer duration | browser site-data deletion |
| `pitchtimer_notes` | HTML string | local rich-text notes | overwritten by user input/import or browser site-data deletion |
| `pitchtimer_notes_title` | plain text | pitch title | overwritten by user input/import or browser site-data deletion |
| `pitchtimer_prompter_font_scale` | number from `1` to `1.8` | prompter text size | browser site-data deletion |
| `pitchtimer_history` | `{ version: 1, records: PitchRecord[] }` | latest pitch runs | clear-history action or browser site-data deletion |

`pitchtimer_history` can still read the legacy array format and writes the
versioned v1 format. Invalid history records are discarded before rendering.
Unsupported future versions are rejected by returning an empty history.

## Project Files

PitchTimer does not have a full editable project format. Notes can be exported
and imported as HTML files:

- export extension: `.html`
- import extensions: `.txt`, `.md`, `.html`
- export media type: `text/html;charset=utf-8`
- maximum import size: 100 KB
- replacement of non-empty notes requires confirmation
- failed imports preserve current notes

## Network and Privacy

The production application does not intentionally send user-created content to
any server. Runtime assets are served from the same origin. There are no
third-party CDNs or application-level analytics.

Hosting providers may process technical connection data while serving static
files. The privacy pages describe this separately from local app content.

The production Content Security Policy uses `connect-src 'none'` because the
app has no runtime network API calls.

## PWA

The PWA configuration generates:

- `manifest.webmanifest`
- precache service worker
- app-shell fallback to `/index.html`
- PNG and SVG icons

Offline behavior is intentionally limited to the app shell and bundled assets.
User content remains local browser state.

## Presentation Mode

Fullscreen mode adds `presentation-mode` to the document body. In this mode,
navigation, history, editor toolbar, import/export controls, and timer controls
are hidden. The notes editor becomes read-only and scrollable. The app requests
a screen wake lock while the timer, preparation countdown, or presentation mode
is active; unsupported browsers ignore this gracefully.

## Deployment

- Target: Cloudflare Pages static deployment
- Build command: `npm run build`
- Output directory: `dist`
- SPA fallback: route requests should serve `index.html`
- Security and cache headers: `public/_headers`
- Fingerprinted assets: immutable cache
- HTML and route fallback: revalidation

## Decisions and Exceptions

- `localStorage` is sufficient because the app stores small preferences, notes
  HTML, and compact history records. IndexedDB is not currently needed.
- Notes use HTML import/export instead of a versioned project file. A project
  archive would be unnecessary until the app stores richer structured pitch
  plans or media.

See `standard-conformance.md` for standard review notes.
