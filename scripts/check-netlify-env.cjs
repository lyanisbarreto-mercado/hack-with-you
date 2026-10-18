const required = ['VITE_AUTH0_DOMAIN', 'VITE_AUTH0_CLIENT_ID', 'VITE_AUTH0_AUDIENCE'];
const missing = required.filter(name => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Missing Netlify build environment variables: ${missing.join(', ')}. Configure them in the Netlify dashboard and redeploy.`);
  process.exitCode = 1;
}
if (process.env.AUTH0_AUDIENCE && process.env.VITE_AUTH0_AUDIENCE && process.env.AUTH0_AUDIENCE !== process.env.VITE_AUTH0_AUDIENCE) {
  console.error('The frontend and backend Auth0 audiences must match the registered Auth0 API Identifier.');
  process.exitCode = 1;
}
