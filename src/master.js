const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const MonitoringServerList = require('./MonitoringServerList');
const HttpMonitor = require('./HttpMonitor');


console.log(`Master ${process.pid} is running`);

// Initialize the server list
const serverList = new MonitoringServerList();
const targetSeverList = [
  { host: 'localhost', port: 8080, monitor_path: '/monitor' },
  { host: 'localhost', port: 8081, monitor_path: '/monitor' }
]
serverList.init(targetSeverList);

const monitorOptions = {
  MONITOR_RETRY_COUNT:3,
  MONITOR_REQUEST_TIMEOUT:1000,
  MONITOR_RETRY_BACKOFF:2000
}

// Fork workers.
for (let i = 0; i < 2; i++) {
//for (let i = 0; i < numCPUs; i++) {
  const worker = cluster.fork();
  // Send the server list to the worker
  worker.send({ type: 'updateServerList', data: serverList.getRunningServerList() });
}

cluster.on('exit', (worker, code, signal) => {
  console.log(`worker ${worker.process.pid} died`);
  console.log('Starting a new worker');
  const newWorker = cluster.fork();
  // Send the server list to the new worker
  newWorker.send({ type: 'updateServerList', data: serverList.getRunningServerList()});
});

// Monitor the servers
targetSeverList.forEach((server) => {
  const monitor = new HttpMonitor(server,monitorOptions);

  monitor.on('down', (server) => {
    // If the server is in the running list, remove it and add it to the down list
    console.log(`Sever ${JSON.stringify(server)} is Down`);
    if (serverList.running.indexOf(server) !== -1) {
      serverList.removeFromRunningServerList(server);
      serverList.pushToDownServerList(server);
      console.log(`Running Server List Update ${JSON.stringify(serverList.getRunningServerList())} `);
      // Notify the workers of the updated server list
      for (const id in cluster.workers) {
        cluster.workers[id].send({ type: 'updateServerList', data: serverList.getRunningServerList()});
      }
    }
  });

  monitor.on('running', (server) => {
    // If the server is in the down list, remove it and add it back to the running list
    if (serverList.down.indexOf(server) !== -1) {
      serverList.removeFromDownServerList(server);
      serverList.pushToRunningServerList(server);

      // Notify the workers of the updated server list
      for (const id in cluster.workers) {
        cluster.workers[id].send({ type: 'updateServerList', data: serverList.getRunningServerList() });
      }
    }
  });

  // Start monitoring every 10 seconds
  setInterval(() => {
    monitor.monitor();
  }, 10000);
});
