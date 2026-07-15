const http = require('http');

console.log('Starting server...');
const server = require('./src/server.js'); // Assuming server.js exports something or just starts the app. Wait, server.js has `server.listen(5000)` and doesn't export the server.
// Actually, if we just require it, it binds to 5000.
setTimeout(() => {
    http.get('http://localhost:5000/health', (res) => {
        console.log(`Health check status: ${res.statusCode}`);
        process.exit(res.statusCode === 200 ? 0 : 1);
    }).on('error', (err) => {
        console.error('Health check failed', err);
        process.exit(1);
    });
}, 3000);
