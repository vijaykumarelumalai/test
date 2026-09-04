const http = require('node:http');

const start = Date.now();
const req = http.get('http://localhost:5000/api/health', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const latency = Date.now() - start;
    if (res.statusCode === 200) {
      console.log(`[HEALTHCHECK] OK (Status: 200, Latency: ${latency}ms)`);
      console.log(`[HEALTHCHECK] Payload: ${data}`);
      process.exit(0);
    } else {
      console.error(`[HEALTHCHECK] FAIL (Status: ${res.statusCode})`);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error(`[HEALTHCHECK] Connection Error: ${err.message}`);
  process.exit(1);
});
