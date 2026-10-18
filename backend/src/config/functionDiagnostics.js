// Log only controlled categories and variable names, never exception messages or URI values.
function functionDiagnostics(error, stage, env = process.env) {
  const missingVariables = ['AUTH0_ISSUER_BASE_URL', 'AUTH0_AUDIENCE']
    .filter(name => !env[name]);
  if (!env.MONGO_URI && !env.MONGODB_URI) missingVariables.push('MONGODB_URI (or MONGO_URI)');
  let code = 'API_REQUEST_FAILED';
  if (missingVariables.length) code = 'RUNTIME_CONFIGURATION_MISSING';
  else if (stage === 'database') {
    const mongoCode = error?.code || error?.cause?.code;
    if (mongoCode === 18) code = 'DATABASE_AUTHENTICATION_FAILED';
    else if (mongoCode === 13) code = 'DATABASE_PERMISSION_DENIED';
    else if (error?.name === 'MongoServerSelectionError' || error?.name === 'MongooseServerSelectionError') code = 'DATABASE_SERVER_UNREACHABLE';
    else if (mongoCode === 'ENOTFOUND' || mongoCode === 'EAI_AGAIN') code = 'DATABASE_DNS_FAILED';
    else code = 'DATABASE_CONNECTION_FAILED';
  } else if (stage === 'configuration') code = 'API_CONFIGURATION_FAILED';
  return { stage, code, ...(missingVariables.length ? { missingVariables } : {}) };
}
module.exports = { functionDiagnostics };
