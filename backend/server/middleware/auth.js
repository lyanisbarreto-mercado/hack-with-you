// middleware/auth.js
const { auth } = require('express-oauth2-jwt-bearer');

module.exports = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
});