module.exports = {
    serverList: [
        { host: 'localhost', port: 8080, monitor_path: '/monitor' },
        { host: 'localhost', port: 8081, monitor_path: '/monitor' },
        { host: 'localhost', port: 3594, monitor_path: '/monitor' }
    ],
    monitorOptions: {
        MONITOR_RETRY_COUNT: 3,
        MONITOR_REQUEST_TIMEOUT: 3000,
        MONITOR_RETRY_BACKOFF: 2000,
    },
    workerCount: 1,//require('os').cpus().length
    httpRequestInterval: 1000, 
    monitorInterval: 5000
};
