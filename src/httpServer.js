// Import the http module
const http = require('http');

// Get the port number from the command line arguments
const port = process.argv[2];

// Create a server on the specified port
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(`Hello World from server on port ${port}!\n`);
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});