# React frontend

This application uses React, Vite, and Auth0.

```sh
npm install
npm run dev
```

The development server runs at http://localhost:5173. Configure `.env.local` using `.env.example`; Vite loads environment files from this directory even though the source code lives in `src/`.

```text
frontend/
├── public/             Static files served directly, e.g. /favicon.ico
├── src/
│   ├── assets/         Images and other assets imported by source code
│   ├── components/     Reusable React components
│   ├── App.jsx         Main application component
│   ├── index.css       Global styles
│   └── main.jsx        React entry point and Auth0 provider
├── index.html          Vite's HTML entry point
├── .env.example        Configuration template
└── package.json        Dependencies and commands
```

Use `npm run build` to generate the production site in `dist/`, then `npm run preview` to preview that build. Edit `index.html` and files in `src/`; `dist/` is generated and is overwritten by builds. Vite supports this layout without an additional configuration file.

The home and member profile screens follow the Fidelities designs. Routes use `#/` for Home, `#/users/me` for your own profile, and `#/users/<username>` for public profiles. Set a username with Edit profile to appear in the member directory.

Filters support multiple selections. Matches require at least one selected tag in every selected category; categories without selections do not restrict results. Confirm applies the draft; closing the popup discards unconfirmed filter changes. Profile edits currently cover username, display name, bio, avatar URL, and tags. Remaining design sections show empty states until their data flows are specified. Message, Events, and Settings are disabled pending their workflows.

Notes is one personal notepad across pages. Drag its header (or focus it and use arrow keys) to reposition it inside the viewport. Save explicitly writes to MongoDB. Closing the popup preserves unsaved text while the app remains open; refreshing or leaving with unsaved text triggers a browser warning. Position is not persisted. Multiple tabs use the most recent successful save.

Run `npm test` for filter matching and viewport constraints. For manual component checks without Auth0 or MongoDB, visit `http://localhost:5173/test/visual.html` while the Vite dev server runs. This uses labeled sample data only, makes no API calls, and is not included in the production build.
