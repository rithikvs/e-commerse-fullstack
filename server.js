// ESM-compatible entrypoint for hosting platforms that run `node server.js`.
// Dynamically import the backend server module so this file works when Node treats
// the project as an ES module (where `require` is not defined).
(async () => {
  try {
    // Ensure the correct path and file extension for dynamic import
    await import('./backend/server.js');
  } catch (err) {
    console.error('Failed to start backend/server.js — make sure the file exists and starts the app.');
    console.error(err && err.stack ? err.stack : err);
    // Exit with non-zero to indicate failure to the host
    process.exit(1);
  }
})();
