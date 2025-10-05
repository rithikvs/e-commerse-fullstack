import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import url from 'url';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const PORT = Number(process.env.PORT) || 5000;

(async () => {
  try {
    // Try to start the backend if available.
    // If backend/server.js requires missing modules, this will throw.
    await import('./backend/server.js');
    console.log('✅ backend/server.js started (full server).');
  } catch (err) {
    console.warn('⚠️ Could not start backend/server.js, falling back to static server.');
    console.warn(err && err.message ? err.message : err);

    // Minimal static server for SPA + small health endpoint
    const contentType = (ext) => {
      switch (ext) {
        case '.html': return 'text/html; charset=utf-8';
        case '.css': return 'text/css; charset=utf-8';
        case '.js': return 'application/javascript; charset=utf-8';
        case '.json': return 'application/json; charset=utf-8';
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.svg': return 'image/svg+xml';
        case '.ico': return 'image/x-icon';
        case '.webp': return 'image/webp';
        default: return 'application/octet-stream';
      }
    };

    const server = createServer(async (req, res) => {
      try {
        const parsed = url.parse(req.url || '/');
        const pathname = decodeURIComponent(parsed.pathname || '/');

        // Lightweight health endpoint
        if (pathname === '/api/health' || pathname === '/api/health/') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'OK', message: 'Static fallback running', timestamp: new Date().toISOString() }));
          return;
        }

        // Serve exact file if exists under dist
        let filePath = path.join(DIST_DIR, pathname);
        // If path is directory, serve index.html inside it
        try {
          const s = await stat(filePath);
          if (s.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
          }
        } catch {
          // filePath may not exist; we'll handle below
        }

        // If requested file exists, serve it
        try {
          const s = await stat(filePath);
          if (s.isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const data = await readFile(filePath);
            res.writeHead(200, { 'Content-Type': contentType(ext) });
            res.end(data);
            return;
          }
        } catch {
          // not found, fall through to serve index.html
        }

        // Fallback: serve SPA index.html
        const indexPath = path.join(DIST_DIR, 'index.html');
        const indexStat = await stat(indexPath).catch(() => null);
        if (indexStat && indexStat.isFile()) {
          const index = await readFile(indexPath, 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(index);
          return;
        }

        // If dist/index.html missing, return helpful message
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('No backend available and no frontend build found in ./dist. Build your frontend with `npm run build`.');
      } catch (err2) {
        console.error('Static server error:', err2 && err2.stack ? err2.stack : err2);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Internal server error');
      }
    });

    server.listen(PORT, () => {
      console.log(`📦 Static fallback server running at http://localhost:${PORT} (serving ./dist)`);
      console.log('ℹ️ Health check: /api/health');
    });
  }
})();
