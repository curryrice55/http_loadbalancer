const CircularLinkedList = require('./CircularLinkedlist');
const EventEmitter = require('events');
const { RunningState, DownState } = require('./ServerState');

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

    updateServerStatus(server, isRunning) {
        let currentStateIsRunning = this.running.contains(server);
        let currentStateIsDown = this.down.contains(server);
    
        // Check if there is a change in state, and update accordingly
        if ((isRunning && !currentStateIsRunning) || (!isRunning && !currentStateIsDown)) {
            const state = isRunning ? new RunningState(this) : new DownState(this);
            state.updateServer(server); 
    
            ++this.version; // Increment the version
            this.emit('update', this.version, this.getRunningServerList()); // Emit an event after the state is updated
        }
    }

    pushToRunningServerList(server){
        this.running.push(server);
    }

    pushToDownServerList(server){
        this.down.push(server);
    }

    removeFromRunningServerList(server){
        this.running.remove(server);
    }

    removeFromDownServerList(server){
        this.down.remove(server);
    }

    getRunningServerList() {
      return this.running.toArray();
    }

    getDownServerList() {
      return this.down.toArray();
    }

    getServerListVersion(){
      return this.version;
    }
}

module.exports = MonitoringServerList