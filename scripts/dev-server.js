// scripts/dev-server.js — servidor local para previsualizar el sitio + /api en dev.
// No se despliega; solo para `npm run dev`. Sin dependencias externas.
// Con el modo mock (lib/mode.js) el flujo de pago/reserva funciona SIN credenciales.
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function shimRes(res) {
  res.status = function (code) { res.statusCode = code; return res; };
  res.json = function (obj) {
    if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(obj));
    return res;
  };
  res.send = function (data) { res.end(data); return res; };
  return res;
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
    });
  });
}

async function handleApi(name, req, res) {
  const file = path.join(ROOT, 'api', name + '.js');
  if (!fs.existsSync(file)) { res.statusCode = 404; res.end('api not found'); return; }
  delete require.cache[require.resolve(file)]; // hot-reload en cada request
  const handler = require(file);
  const parsed = url.parse(req.url, true);
  req.query = parsed.query;
  if (req.method === 'POST' || req.method === 'PUT') req.body = await readBody(req);
  shimRes(res);
  try { await handler(req, res); if (!res.writableEnded) res.end(); }
  catch (e) { console.error('[dev] api error', e); if (!res.writableEnded) { res.statusCode = 500; res.end('error'); } }
}

function serveStatic(reqPath, res) {
  let p = decodeURIComponent(reqPath.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  let fp = path.join(PUBLIC, p);
  // seguridad básica anti path-traversal
  if (!fp.startsWith(PUBLIC)) { res.statusCode = 403; res.end('forbidden'); return; }
  if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
  if (!fs.existsSync(fp)) {
    // sin extensión => fallback a index.html (como el rewrite de Vercel)
    if (!path.extname(p)) fp = path.join(PUBLIC, 'index.html');
    else { res.statusCode = 404; res.end('not found'); return; }
  }
  const ext = path.extname(fp).toLowerCase();
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(fp).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const pathname = url.parse(req.url).pathname;
  if (pathname.startsWith('/api/')) {
    const name = pathname.slice(5).replace(/\/$/, '');
    await handleApi(name, req, res);
    return;
  }
  serveStatic(pathname, res);
});

server.listen(PORT, () => {
  const mock = require('../lib/mode.js').isMock();
  console.log(`\n  ▸ Dev server:  http://localhost:${PORT}`);
  console.log(`  ▸ Cotizador:   http://localhost:${PORT}/app/`);
  console.log(`  ▸ Reservar:    http://localhost:${PORT}/reservar.html`);
  console.log(`  ▸ Modo MOCK:   ${mock ? 'ON (pagos/reservas simulados, sin credenciales)' : 'OFF (usando credenciales reales)'}\n`);
});
