const cluster = require('cluster');
const http = require('http');
const config = require('./config');
const MonitoringServerList = require('./MonitoringServerList');
const HttpMonitor = require('./HttpMonitor');

// Initializes and manages the master process
function master() {
  console.log(`Master ${process.pid} is running`);

  // Initialize the server list and set up event listeners for updates
  const targetServerList = new MonitoringServerList().init(config.serverList);
  targetServerList.on('update', (version, updatedServerList) => {
    console.debug(`Master: ${process.pid} will send ver.${version} 's  ${JSON.stringify(updatedServerList)}`);
    notifyAllWorkers(updatedServerList);
  });

  // Create worker processes and set up monitoring for each server
  setupWorkers(targetServerList);

  // Start monitoring each server in the running server list
  targetServerList.getRunningServerList().forEach(server => {
    const monitor = new HttpMonitor(server, config.monitorOptions);
    monitor.on('down', (server) => targetServerList.updateServerStatus(server, false));
    monitor.on('running', (server) => targetServerList.updateServerStatus(server, true));
    setInterval(() => monitor.monitor(), config.monitorInterval);
  });
}

// Sets up worker processes and handles worker restarts
function setupWorkers(serverList) {
  // Create worker processes up to the configured count
  for (let i = 0; i < config.workerCount; i++) {
    const worker = cluster.fork();
    worker.send({ type: 'updateServerList', data: serverList.getRunningServerList() });
  }

  // Restart any worker that exits
  cluster.on('exit', () => restartWorker(serverList));
}

// Restarts a worker process when one exits
function restartWorker(serverList) {
  console.log('Starting a new worker');
  const newWorker = cluster.fork();
  newWorker.send({ type: 'updateServerList', data: serverList.getRunningServerList() });
}

// Sends the current server list to all worker processes
function notifyAllWorkers(serverList) {
  Object.values(cluster.workers).forEach(worker => {
    worker.send({ type: 'updateServerList', data: serverList });
  });
}

// Manages the worker process logic
function worker() {
  console.log(`Worker ${process.pid} is running`);
  let serverList = [];

  // Update local server list when notified by the master process
  process.on('message', message => {
    if (message.type === 'updateServerList') {
      serverList = message.data;
      console.debug(`Worker: ${process.pid} received ${JSON.stringify(serverList)}`);
    }
  });

  // Periodically make HTTP requests to each server in the list
  setInterval(() => {
    if (serverList.length === 0) {
      console.debug(`Worker: ${process.pid} does not have serverlist ${JSON.stringify(serverList)}`) 
      return;
    }
    const currentServer = serverList.shift();
    serverList.push(currentServer); // Rotate the server list
    const options = createRequestOptions(currentServer);
    makeHttpRequest(options, currentServer);
  }, config.httpRequestInterval);
}

// Makes an HTTP request to a given server and handles the response
function makeHttpRequest(options, server) {
  const req = http.request(options, res => {
    console.log(`Worker: ${process.pid} received response from server: ${server.host}:${server.port}`);
    res.on('data', () => {}); // Intentionally left blank
    res.on('end', () => {});  // Intentionally left blank
  });

  req.on('error', e => {
    console.error(`Worker: ${process.pid} request error: ${e.message}`);
  });
  req.end();
}

// Creates the options object for an HTTP request based on server configuration
function createRequestOptions(server) {
  return {
    host: server.host,
    port: server.port,
    path: server.monitor_path,
    method: 'GET',
  };
}

// Determines the process role (master or worker) and starts the corresponding logic
if (cluster.isMaster) {
  master();
} else {
  worker();
}
