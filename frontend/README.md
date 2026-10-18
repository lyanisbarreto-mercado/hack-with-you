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
