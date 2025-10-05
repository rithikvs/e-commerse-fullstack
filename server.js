// Simple entrypoint so hosting platforms that run `node server.js` (like Render) find the server.
// It delegates to the existing backend/server.js which already starts the Express app.
try {
  require('./backend/server');
} catch (err) {
  // Helpful error output for deployment logs
  console.error('Failed to start backend/server.js — make sure the file exists and exports/starts the app.');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
}
