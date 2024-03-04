const MonitoringServerList = require('../src/MonitoringServerList');
const EventEmitter = require('events');

// CircularLinkedListのモックを作成
jest.mock('../src/CircularLinkedlist', () => {
  return jest.fn().mockImplementation(() => {
    return {
      push: jest.fn(),
      remove: jest.fn(),
      toArray: jest.fn(() => ['server1', 'server2'])
    };
  });
});

describe('MonitoringServerList', () => {
  let serverList;

  beforeEach(() => {
    serverList = new MonitoringServerList();
  });

  test('init should populate running server list', () => {
    const servers = ['server1', 'server2'];
    serverList.init(servers);
    expect(serverList.running.toArray()).toEqual(servers);
  });

  test('pushToRunningServerList should add a server to running list and increment version', () => {
    const server = 'server3';
    const initialVersion = serverList.version;
    serverList.pushToRunningServerList(server);
    expect(serverList.running.push).toHaveBeenCalledWith(server);
    expect(serverList.version).toBe(initialVersion + 1);
  });

  test('pushToDownServerList should add a server to down list and increment version', () => {
    const server = 'server4';
    const initialVersion = serverList.version;
    serverList.pushToDownServerList(server);
    expect(serverList.down.push).toHaveBeenCalledWith(server);
    expect(serverList.version).toBe(initialVersion + 1);
  });

  test('removeFromRunningServerList should remove a server from running list and increment version', () => {
    const server = 'server1';
    const initialVersion = serverList.version;
    serverList.removeFromRunningServerList(server);
    expect(serverList.running.remove).toHaveBeenCalledWith(server);
    expect(serverList.version).toBe(initialVersion + 1);
  });

  test('removeFromDownServerList should remove a server from down list and increment version', () => {
    const server = 'server2';
    const initialVersion = serverList.version;
    serverList.removeFromDownServerList(server);
    expect(serverList.down.remove).toHaveBeenCalledWith(server);
    expect(serverList.version).toBe(initialVersion + 1);
  });

  test('getRunningServerList should return an array of running servers', () => {
    expect(serverList.getRunningServerList()).toEqual(['server1', 'server2']);
  });

  test('getDownServerList should return an array of down servers', () => {
    expect(serverList.getDownServerList()).toEqual(['server1', 'server2']);
  });
});

