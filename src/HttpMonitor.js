const http = require('http');
const EventEmitter = require('events');

class HttpMonitor extends EventEmitter {
    constructor(targetHttpServer, monitorOptions){
        super();
        this.targetHttpServer = targetHttpServer;
        this.httpOptions = {
            host: targetHttpServer.host,
            prot: targetHttpServer.port,
            path: targetHttpServer.monitor_path,
            method: 'GET'
        }

        this.monitorRetryCount = monitorOptions.MONITOR_RETRY_COUNT;
        this.monitorRequestTimeout = monitorOptions.MONITOR_REQUEST_TIMEOUT;
        this.monitorRetryBackoff = monitorOptions.MONITOR_RETRY_BACKOFF;
    }

    monitor(){
        let retryCount = 0;
        const self = this;
        function httpRequest(){
            const request = http.request(self.options);
            
            request.on('socket', (socket) =>{
                //Setting timeout
                socket.setTimeout(self.monitorRequestTimeout);
                socket.on('timeout', function(){
                    request.destroy();
                })
            });

            request.on('response',() =>{
                self.emit('running', self.targetHttpServer);
            });

            request.on('error', (err) => {
                console.error('Request error:', err);
                if(retryCount++ > self.monitorRetryCount){
                    self.emit('down', self.targetHttpServer);
                    return;
                }
            setTimeout(httpRequest, self.monitorRetryBackoff);
            });

            request.end();
        }
        httpRequest();
    }
}

const httpMonitorTest = new HttpMonitor({host:'10.1.1.1', port:8080, monitor_path:'/monitor'},{MONITOR_RETRY_COUNT:3,MONITOR_REQUEST_TIMEOUT:5000,MONITOR_RETRY_BACKOFF:1000});
console.log(typeof(httpMonitorTest.monitorRequestTimeout))
httpMonitorTest.monitor();


httpMonitorTest.on('down', (targetHttpServer)=>{
    console.log('OHHHH')
    console.log(targetHttpServer)
})

function monitor(){
    console.log('hehehehe');
}


