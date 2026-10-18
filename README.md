# hack-with-you

The backend uses CommonJS and Auth0 bearer access tokens. Its entry point is `backend/src/server.js`, with the MongoDB helper in `backend/src/config/db.js`. Existing routes and models remain in `backend/server/`; `backend/server/index.js` forwards to the same application for compatibility. Start it from `backend/`:

```sh
npm install
npm run dev
```

Configure `backend/server/.env` using `backend/server/.env.example`. Existing environment values are not overwritten. Set `AUTH0_ISSUER_BASE_URL` to your tenant's HTTPS URL and `AUTH0_AUDIENCE` to your registered API identifier. The frontend's audience must match. `MONGODB_URI` is also accepted as an alias for `MONGO_URI`. MongoDB must be reachable before the API starts. The default API port is 5001.

`GET /api/health` is public. `/api/notes` and `/api/profile/me` require an Auth0 access token in `Authorization: Bearer <token>`. The first authenticated profile request creates a MongoDB profile keyed by the verified token's `sub`. `PATCH /api/profile/me` updates profile fields; `GET /api/profile/:username` returns public fields only. Existing accounts are not automatically linked by email.

Login, registration, Google login, and logout should be handled by the Auth0 React SDK; the backend no longer issues login cookies. The React frontend lives in `frontend/` and uses Auth0Provider with configuration from `frontend/.env.local`.

Run backend checks with `cd backend && npm test`. These checks cover public health access and rejection of absent or malformed credentials; a real Auth0 login and MongoDB connection are required for end-to-end verification.

Local environment files and generated dependencies are excluded from Git tracking. Credentials previously committed remain in repository history and should be rotated before sharing that history.

Install and run the frontend in a second terminal:

```sh
cd frontend
npm install
npm run dev
```

Use `frontend/.env.example` for configuration. Register `http://localhost:5173` as an allowed callback URL, logout URL, and web origin in your Auth0 SPA application. The frontend audience must equal the backend `AUTH0_AUDIENCE`. Run `npm run build` in `frontend/` to verify the production bundle. From the repository root, `npm run dev`, `npm run dev:backend`, `npm run build`, and `npm test` delegate to the appropriate project. Node 24 LTS is recommended.

For future pulls, use `git pull --no-rebase origin main` to merge teammate commits while preserving history.

The member directory is available at `GET /api/profile`. Authenticated profile updates accept `commitment`, `technology`, and `industry` tag arrays along with the existing basic fields. Only public profile fields are returned by directory and username lookups.

`GET /api/notes` and `PUT /api/notes` read and save one private notepad for the verified Auth0 identity. PUT accepts `{ "content": "your note" }` (maximum 20,000 characters). The owner is always taken from the validated token, never a request-supplied user ID. Restart the backend after these route changes.

Imported members are read from the `People` collection in the `user` database using the existing MongoDB connection. They appear alongside Auth0 profiles in the directory and open through stable `~people.<MongoDB ID>` profile keys; no username or account linking is required. Imported records are read-only through this API.

The API maps `first_name` and `last_name` to the display name, `coding_languages` to technology tags, `hackathon_experience` to experience, `learning_interest` to Learning, `competitive` to Competitive/Casual, `github_link` and `linkedin_link` to social links, and `project_description` to the current project text. Pronouns are displayed directly. Recognized learning interests also populate industry tags, including normalization of Cybersecurity to Cyber Security. Fields absent from the data, such as organizations and upcoming events, retain their empty states. Email and imported notes are never included in public profile responses.

`MOCK_DATA.json` is only a local reference; the application does not import it or require it at runtime. Removing that file does not remove MongoDB records. Restart the backend after changing profile routes.

Deployment to `https://hackwithyou.netlify.app` uses the root `netlify.toml`, a Vite production build, and an Express Netlify Function. See [the Netlify deployment instructions](docs/NETLIFY.md) for dashboard variables, Auth0 URLs, Atlas access, and live checks. Local environment files are not uploaded or changed by this setup.
