const HttpMonitor = require('../src/HttpMonitor');
const http = require('http');
const EventEmitter = require('events');

// http.requestをモックする
jest.mock('http', () => ({
  request: jest.fn()
}));

describe('HttpMonitor', () => {
  let httpMonitor;
  const targetHttpServer = { host: '10.1.1.1', port: 8080, monitor_path: '/monitor' };
  const monitorOptions = { MONITOR_RETRY_COUNT: 3, MONITOR_REQUEST_TIMEOUT: 5000, MONITOR_RETRY_BACKOFF: 1000 };

  beforeEach(() => {
    // HttpMonitorインスタンスを作成
    httpMonitor = new HttpMonitor(targetHttpServer, monitorOptions);
    // http.requestのモックをリセット
    http.request.mockReset();
  });

  test('monitor should emit "running" on successful response', (done) => {
    // http.requestのモック実装
    http.request.mockImplementation(() => {
      const EventEmitter = require('events').EventEmitter;
      const response = new EventEmitter();
      response.statusCode = 200;
      process.nextTick(() => response.emit('end')); // responseが終了したことを示すイベントを非同期で発行

      return {
        on: (event, callback) => {
          if (event === 'response') process.nextTick(() => callback(response));
        },
        end: jest.fn()
      };
    });

    httpMonitor.on('running', (server) => {
      expect(server).toEqual(targetHttpServer);
      done(); // 非同期テストの完了をJestに通知
    });

    httpMonitor.monitor();
  });

  // 他のシナリオ（'down'イベント、リトライロジックなど）に対するテストも同様に追加可能
});

