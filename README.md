# hack-with-you

The backend uses CommonJS and Auth0 bearer access tokens. Start it from `backend/`:

```sh
npm install
npm run dev
```

Configure `backend/server/.env` using `backend/server/.env.example`. Existing environment values are not overwritten. Set `AUTH0_ISSUER_BASE_URL` to your tenant's HTTPS URL and `AUTH0_AUDIENCE` to your registered API identifier. The frontend's audience must match. `MONGODB_URI` is also accepted as an alias for `MONGO_URI`. MongoDB must be reachable before the API starts. The default API port is 5001.

`GET /api/health` is public. `/api/notes` and `/api/profile/me` require an Auth0 access token in `Authorization: Bearer <token>`. The first authenticated profile request creates a MongoDB profile keyed by the verified token's `sub`. `PATCH /api/profile/me` updates profile fields; `GET /api/profile/:username` returns public fields only. Existing accounts are not automatically linked by email.

Legacy `server/routes/auth.js` and `server/config/passport.js` are inactive and retained for migration reference. Login, registration, Google login, and logout should be handled by the Auth0 React SDK; the backend no longer issues login cookies. The React frontend lives in `frontend/` and uses Auth0Provider with configuration from `frontend/.env.local`.

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
