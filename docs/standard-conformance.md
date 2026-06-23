# haak3 Standard Conformance

Standard:
https://github.com/ChristianHaake/haak3-webapp-standard

Standard version: `1.0.0-draft`

Last reviewed: `2026-06-16`

## Exceptions

No exceptions are currently documented.

Use this format for every exception:

```text
Rule:
Reason:
Scope:
Temporary or permanent:
Review date:
```

## App-specific decisions

- `localStorage` is used for all persisted state because PitchTimer stores only
  small text, HTML notes, and preference data. IndexedDB is not needed unless
  future versions add media or larger project files.
- Pitch notes use `.html` export and `.txt`, `.md`, or `.html` import. There is
  no full project archive because the current editable data model is
  intentionally just notes, timer preset, language, prompter text size, and
  compact history.
- Imported notes are persisted from the normalized editor document rather than
  raw imported file bytes.
- The app includes a clear-local-data action for all PitchTimer-owned browser
  storage keys.
- The app is a PWA for installability and offline app-shell access. It does not
  add runtime network features.
