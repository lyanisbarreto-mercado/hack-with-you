# Deploy hackWithYou to Netlify

The repository is prepared to serve React and the Express API together at https://hackwithyou.netlify.app. The frontend calls `/api` on its own domain, and Netlify rewrites these requests to the Express function. No separate server process or localhost address is required in production.

Connect this Git repository to your existing Netlify project and deploy the branch containing these changes. Keep the base directory at the repository root (`.`), not `frontend/`, so Netlify packages the backend function too. `netlify.toml` sets the build command, publishes `frontend/dist`, and packages `netlify/functions`. It selects Node 24. Use Git-based builds rather than uploading only the `dist` folder; a static-only upload will omit the API.

Set these environment variables in the Netlify project dashboard before deploying. Do not upload local `.env` or credential files. Where environment scopes are available, use the scopes below. Otherwise make the variables available to the build and Functions.

| Variable | Value | Scope |
| --- | --- | --- |
| `VITE_AUTH0_DOMAIN` | Your existing Auth0 domain, without `https://` | Builds |
| `VITE_AUTH0_CLIENT_ID` | Your Auth0 SPA application client ID | Builds |
| `VITE_AUTH0_AUDIENCE` | Exact Identifier of the API registered in your Auth0 tenant | Builds |
| `AUTH0_ISSUER_BASE_URL` | `https://YOUR_TENANT.us.auth0.com/` | Functions |
| `AUTH0_AUDIENCE` | Exactly the same registered API Identifier as `VITE_AUTH0_AUDIENCE` | Functions |
| `MONGODB_URI` | Your existing complete Atlas connection string, retaining its database name | Functions |

`MONGO_URI` is also accepted; set one MongoDB URI variable, not conflicting values in both. Keep MongoDB credentials out of all `VITE_` variables. The deployed frontend and API share one origin, so no frontend-origin variable is required. `PORT`, `JWT_SECRET`, Google client secrets, and an Auth0 client secret are not required for this deployment.

`netlify.toml` sets `VITE_API_URL` to an empty string for the build, which makes the API same-origin. Remove any dashboard override pointing it to localhost. Backend values must be provided in the dashboard; placing them only in `netlify.toml` does not provide them to function runtime. Redeploy after changing environment values because frontend configuration is baked into the build.

In the Auth0 SPA application's settings, add `https://hackwithyou.netlify.app` to Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins. Keep localhost entries if you still develop locally. The backend audience and frontend audience must match an API that actually exists in the same tenant. The API identifier is a logical identifier; it does not have to be the Netlify site URL. A "Service not found" error means the requested identifier is not registered correctly in that tenant.

Atlas must permit network connections from your hosted Netlify Functions, not just your laptop. Configure the Atlas network access rules for your deployment's outbound network. Its database user needs access to the app's profile and note collections and read access to `user.People`. Preserve the original URI database path so authenticated profiles and notes remain in their existing database. Imported member reads still explicitly use the `user` database and `People` collection. This setup does not migrate or rewrite records.

After a successful deploy:

1. Open https://hackwithyou.netlify.app/ and confirm the application loads.
2. Open https://hackwithyou.netlify.app/api/health and expect `{"status":"ok"}`. This checks database connectivity too.
3. Open https://hackwithyou.netlify.app/api/profile and expect the public member list.
4. Confirm member cards, filters, and public profile links work in the main site.
5. Log in, edit your own profile, save a note, reload, and confirm the saved note returns.
6. Open `/api/notes` without an access token and expect HTTP 401; notes must not be public.

A 404 at `/api/health` usually means the function or rewrite was omitted, often because the project's base directory was set to `frontend/`. HTTP 503 means function configuration or Atlas connectivity is failing; check Netlify function logs. HTTP 200 with HTML instead of JSON means the SPA fallback handled an API request; keep the `/api/*` rewrite before the fallback. Auth0 callback errors require updating the allowed URLs or registered API Identifier.

Sources: [Express on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/express/), [function environment variables](https://docs.netlify.com/build/functions/environment-variables/), and [Auth0 React setup](https://auth0.com/docs/quickstart/spa/react).

Function logs include controlled diagnostic codes without printing credentials or exception messages: `RUNTIME_CONFIGURATION_MISSING` lists missing variable names; `DATABASE_SERVER_UNREACHABLE` indicates server selection/network connectivity failed; `DATABASE_AUTHENTICATION_FAILED` indicates database login failed; `DATABASE_PERMISSION_DENIED` indicates the database account lacks permissions; and `DATABASE_DNS_FAILED` indicates hostname resolution failed. Open the API function logs after requesting `/api/health` to inspect the code. A server-selection failure alone does not prove an IP allowlist issue; confirm Atlas network access, cluster availability, and the connection string host.
