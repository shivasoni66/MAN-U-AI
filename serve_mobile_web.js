const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const WEB_ROOT = path.join(__dirname, 'apps', 'mobile', 'build', 'web');
const TARGET_API_HOST = process.env.PROXY_TARGET_HOST || 'man-u-ai.onrender.com';

process.on('uncaughtException', (err) => {
  console.error('[Process Uncaught Exception]:', err.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Process Unhandled Rejection]:', reason);
});

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  req.on('error', (err) => {
    console.error('[Client Request Error]:', err.message);
  });

  res.on('error', (err) => {
    console.error('[Server Response Error]:', err.message);
  });

  // Global CORS and cross-origin headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Handle /api proxying
  if (req.url.startsWith('/api')) {
    const proxyHeaders = {
      ...req.headers,
      host: TARGET_API_HOST,
      origin: 'https://man-u-ai-1.onrender.com', // Render CORS whitelist origin
    };

    const proxyReq = https.request(
      {
        hostname: TARGET_API_HOST,
        port: 443,
        path: req.url,
        method: req.method,
        headers: proxyHeaders,
      },
      (proxyRes) => {
        proxyRes.on('error', (err) => {
          console.error('[Proxy Response Stream Error]:', err.message);
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: { code: 'BAD_GATEWAY', message: err.message } }));
          } else {
            res.destroy();
          }
        });

        const responseHeaders = { ...proxyRes.headers };
        responseHeaders['access-control-allow-origin'] = '*';
        responseHeaders['access-control-allow-credentials'] = 'true';

        if (!res.headersSent) {
          res.writeHead(proxyRes.statusCode, responseHeaders);
        }
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      console.error('[Mobile Web Proxy Error]:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: false,
            error: {
              code: 'PROXY_GATEWAY_ERROR',
              message: `Could not reach ${TARGET_API_HOST}: ${err.message}`,
            },
          })
        );
      } else {
        res.destroy();
      }
    });

    req.pipe(proxyReq);
    return;
  }

  // Serve static files
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  let filePath = path.join(WEB_ROOT, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(WEB_ROOT, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
        return;
      }

      if (!res.headersSent) {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
        });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[MAN-U-AI Mobile Web] Serving ${WEB_ROOT} on http://0.0.0.0:${PORT} (Proxying /api -> https://${TARGET_API_HOST})`);
});
