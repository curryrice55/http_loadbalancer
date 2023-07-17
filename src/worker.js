const http = require('http');
const cluster = require('cluster');

let serverList = null;

process.on('message', (msg) => {
  if (msg.type === 'updateServerList') {
    // Update the server list
    serverList = msg.data;
    serverIndex = 0; // Reset the server index when the server list is updated  
  }
});


function sendRequest() {
  if (!serverList || serverList.length === 0) return;

  // Get the next server
  const server = serverList[serverIndex];

  // Increment the server index, and reset it if it's larger than the length of the server list
  serverIndex = (serverIndex + 1) % serverList.length;

  // Send the HTTP request to the server
  const options = {
    hostname: server.ip,
    port: server.port,
    path: serve.path,
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    // Handle the response

    // Send the next request
    sendRequest();
  });

  req.on('error', (error) => {
    // Handle the error

    // Send the next request
    sendRequest();
  });

  req.end();
}

  // Start sending requests
  sendRequest();
