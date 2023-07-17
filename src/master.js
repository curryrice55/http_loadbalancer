const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const MonitoringServerList = require('./MonitoringServerList');
const HttpMonitor = require('./HttpMonitor');

function master(){
  console.log(`Master ${process.pid} is running`);

  // Initialize the server list
  const serverList = new MonitoringServerList();
  serverList.init([
    { host: 'localhost', port: 8080, monitor_path: '/monitor' },
    { host: 'localhost', port: 8081, monitor_path: '/monitor' },
    { host: 'localhost', port: 8082, monitor_path: '/monitor' },
  ]);

  const monitorOptions = {
    MONITOR_RETRY_COUNT:3,
    MONITOR_REQUEST_TIMEOUT:3000,
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
  serverList.getRunningServerList().forEach((server) => {
    const monitor = new HttpMonitor(server,monitorOptions);
  
    monitor.on('down', () => {
      // If the server is in the running list, remove it and add it to the down list
      if (serverList.running.indexOf(server) !== -1) {
        serverList.removeFromRunningServerList(server);
        serverList.pushToDownServerList(server);

        // Notify the workers of the updated server list
        for (const id in cluster.workers) {
          cluster.workers[id].send({ type: 'updateServerList', data: serverList.getRunningServerList()});
        }
      }
    });

    monitor.on('running', () => {
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
}

function worker(){

  console.log(`Worker ${process.pid} is running`);
  let serverList = null;

  process.on('message', (msg) => {
    if (msg.type === 'updateServerList') {
      // Update the server list
      serverList = msg.data;
      console.debug(`Woker: ${process.pid} received ${JSON.stringify(serverList)}`)
      serverIndex = 0; // Reset the server index when the server list is updated
    }
  });
}

if (cluster.isMaster) {
  // Master process
  master();
} else {
  // Worker processes
  worker();
}
