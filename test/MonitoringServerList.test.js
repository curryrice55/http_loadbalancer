const MonitoringServerList = require('../src/MonitoringServerList'); // Adjust the path as necessary
const CircularLinkedList = require('../src/CircularLinkedlist'); // Adjust the path as necessary
const { RunningState, DownState } = require('../src/ServerState'); // Adjust the path as necessary

// Mock dependencies
jest.mock('../src/CircularLinkedlist', () => {
  return jest.fn().mockImplementation(() => ({
    push: jest.fn(),
    contains: jest.fn(),
    remove: jest.fn(),
    toArray: jest.fn()
  }));
});

jest.mock('../src/ServerState', () => ({
  RunningState: jest.fn().mockImplementation(() => ({
    updateServer: jest.fn()
  })),
  DownState: jest.fn().mockImplementation(() => ({
    updateServer: jest.fn()
  }))
}));

describe('MonitoringServerList', () => {
  let serverList;
  const mockServer = 'server1';

  beforeEach(() => {
    serverList = new MonitoringServerList();
  });

  describe('init', () => {
    it('should initialize the server list with the provided servers', () => {
      serverList.init([mockServer]);
      expect(serverList.running.push).toHaveBeenCalledWith(mockServer);
    });
  });

  describe('updateServerStatus', () => {
    beforeEach(() => {
      // 各テストの前にモックをリセット
      RunningState.mockClear();
      DownState.mockClear();
      serverList.running.contains.mockReset();
      serverList.down.contains.mockReset();
    });
  
    it('should transition server from running to down state', () => {
      serverList.running.contains.mockReturnValue(true); // サーバーは最初に実行中
      serverList.down.contains.mockReturnValue(false);
  
      serverList.updateServerStatus(mockServer, false); // ダウンに更新
  
      expect(DownState).toHaveBeenCalledTimes(1); // DownState コンストラクタが呼び出されるべき
      expect(serverList.version).toBeGreaterThan(0);
    });
  
    it('should transition server from down to running state', () => {
      serverList.running.contains.mockReturnValue(false);
      serverList.down.contains.mockReturnValue(true); // サーバーは最初にダウン状態
  
      serverList.updateServerStatus(mockServer, true); // 実行中に更新
  
      expect(RunningState).toHaveBeenCalledTimes(1); // RunningState コンストラクタが呼び出されるべき
      expect(serverList.version).toBeGreaterThan(0);
    });
  
    it('should not update if server is already in the desired state', () => {
      serverList.running.contains.mockReturnValue(true); // サーバーは既に実行中
  
      serverList.updateServerStatus(mockServer, true); // 実行中に更新しようとする
  
      expect(RunningState).not.toHaveBeenCalled();
      expect(DownState).not.toHaveBeenCalled();
    });
  });
  
});
