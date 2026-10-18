# hack-with-you

The backend uses CommonJS and Auth0 bearer access tokens. Start it from `backend/`:

```sh
npm install
npm run dev
```

Configure `backend/server/.env` using `backend/server/.env.example`. Existing environment values are not overwritten. Set `AUTH0_ISSUER_BASE_URL` to your tenant's HTTPS URL and `AUTH0_AUDIENCE` to your registered API identifier. The frontend's audience must match. MongoDB must be reachable before the API starts. The default API port is 5001.

`GET /api/health` is public. `/api/notes` and `/api/profile/me` require an Auth0 access token in `Authorization: Bearer <token>`. The first authenticated profile request creates a MongoDB profile keyed by the verified token's `sub`. `PATCH /api/profile/me` updates profile fields; `GET /api/profile/:username` returns public fields only. Existing accounts are not automatically linked by email.

Legacy `server/routes/auth.js` and `server/config/passport.js` are inactive and retained for migration reference. Login, registration, Google login, and logout should be handled by the Auth0 React SDK; the backend no longer issues login cookies. The frontend still needs a React application and Auth0Provider.

Run backend checks with `cd backend && npm test`. These checks cover public health access and rejection of absent or malformed credentials; a real Auth0 login and MongoDB connection are required for end-to-end verification.

Environment files are ignored for future additions. Files already tracked by Git remain tracked; avoid committing credentials.
