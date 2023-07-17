const CircularLinkedList = require('./CircularLinkedlist');
const EventEmitter = require('events');

class MonitoringServerList extends EventEmitter{
    constructor(){
        super();
        this.version = 0;
        this.running = new CircularLinkedList();
        this.down = new CircularLinkedList();
    }

    init(serverList) {
        serverList.forEach(server => {
            this.running.push(server);
        });
        return this;
    }

    pushToRunningServerList(server){
        ++this.version;
        this.running.push(server);
    }

    pushToDownServerList(server){
        ++this.version;
        this.down.push(server);
    }

    removeFromRunningServerList(server){
        ++this.version;
        this.running.remove(server);
    }

    removeFromDownServerList(server){
        ++this.version;
        this.down.remove(server);
    }

    getRunningServerList() {
      return this.running.toArray();
    }

    getDownServerList() {
      return this.down.toArray();
    }
    
}

module.exports = MonitoringServerList
//const serverList = new MonitoringServerList();
//const sample_list = [{ ip:'10.1.1.1',port:6089}, { ip:'10.1.1.2',port:6089}]
//const initServerList = serverList.init(sample_list);
//console.log(initServerList.running)
//console.log(initServerList.down)
//initServerList.removeFromRunningServerList({ ip:'10.1.1.2',port:6089})
//initServerList.pushToDownServerListList({ ip:'10.1.1.2',port:6089})
//console.log(initServerList.running.next().item.ip)
//console.log(initServerList.down)

//initServerList.pushToDownServerListList({ip:'10.1.1.2',port:6089})


