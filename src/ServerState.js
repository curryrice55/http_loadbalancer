// ServerState.js
class ServerState {
  constructor(monitoringServerList) {
    if (new.target === ServerState) {
      throw new TypeError("Cannot construct ServerState instances directly");
    }
    this.monitoringServerList = monitoringServerList;
  }
  // Method to update the server according to its state (to be implemented in concrete classes)
  updateServer(server) {
    throw new Error("Method 'updateServer()' must be implemented.");
  }
}

class RunningState extends ServerState {
  updateServer(server) {
    // If the server is in the down list, remove it
    this.monitoringServerList.removeFromDownServerList(server);
    // Add the server to the running list
    this.monitoringServerList.pushToRunningServerList(server);
  }
}

class DownState extends ServerState {
  updateServer(server) {
    // If the server is in the running list, remove it
    this.monitoringServerList.removeFromRunningServerList(server);
    // Add the server to the down list
    this.monitoringServerList.pushToDownServerList(server);
  }
}

module.exports = { RunningState, DownState };