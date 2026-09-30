const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '0.0.0.0';
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.bin': 'application/octet-stream',
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
    let reqUrl = decodeURI(req.url.split('?')[0]);

    // Handle root redirection / default route
    if (reqUrl === '/') {
        reqUrl = '/Voyager-Interactive/index.html';
    } else if (reqUrl === '/portfolio') {
        reqUrl = '/index.html';
    } else if (reqUrl.endsWith('/')) {
        reqUrl += 'index.html';
    }

    let filePath = path.join(ROOT, reqUrl);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Check if it's a directory containing index.html
            if (stats && stats.isDirectory()) {
                const subIndex = path.join(filePath, 'index.html');
                if (fs.existsSync(subIndex)) {
                    filePath = subIndex;
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                    return;
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const totalSize = stats.size;

        // Support HTTP Range requests (crucial for video & large 3D models)
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

            if (start >= totalSize || end >= totalSize || start > end) {
                res.writeHead(416, { 'Content-Range': `bytes */${totalSize}` });
                res.end();
                return;
            }

            const chunksize = (end - start) + 1;
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${totalSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });

            fs.createReadStream(filePath, { start, end }).pipe(res);
            return;
        }

        // Standard 200 response
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': totalSize,
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': ext === '.glb' || ext === '.jpg' || ext === '.png' ? 'public, max-age=31536000' : 'no-cache'
        });

        if (req.method === 'HEAD') {
            res.end();
            return;
        }

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        stream.on('error', () => {
            res.end();
        });
    });
});

server.listen(PORT, () => {
    console.log(`Render server active on port ${PORT}`);
    console.log(`Serving Voyager 3D model directly at http://localhost:${PORT}/`);
    console.log(`Serving Portfolio at http://localhost:${PORT}/portfolio`);
});
