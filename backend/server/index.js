// Compatibility entry point; the application lives in src/server.js.
const { createApp, start } = require('../src/server');

if (require.main === module) {
  start().catch(() => {
    console.error('API startup failed. Check configuration, MongoDB connectivity, and port availability.');
    process.exitCode = 1;
  });
}

module.exports = { createApp, start };
