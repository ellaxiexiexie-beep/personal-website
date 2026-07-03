const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(BASE, req.url === '/' ? '/startup-site/index.html' : req.url);
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('Not Found: ' + req.url);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}/`);
  console.log(`  Open http://localhost:${PORT}/ in your browser`);
});
