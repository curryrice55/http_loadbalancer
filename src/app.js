const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Master process
  require('./master.js');
} else {
  // Worker processes
  require('./worker.js');
}

