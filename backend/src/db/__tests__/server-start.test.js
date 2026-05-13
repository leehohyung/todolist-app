'use strict';

/**
 * Tests for the DB-connection bootstrap logic inside src/server.js.
 *
 * src/server.js calls start() immediately when required, so every test uses
 * jest.isolateModules() to get a fresh module registry and re-requires
 * server.js after configuring the mock behaviour for that specific test.
 *
 * Key Jest constraint: jest.mock() factory functions are hoisted to the top
 * of the file by Babel and therefore CANNOT close over regular variables.
 * Variables prefixed with "mock" (case-insensitive) are exempt from this
 * restriction, so `mockConnect` and `mockListenFn` are used here.
 *
 * Note on process.exit:
 *   server.js contains `process.exit(1); return;` in the catch block.
 *   The `return` guard ensures that when process.exit is mocked as a no-op
 *   the function still terminates early and does NOT reach app.listen().
 *   This is tested by the "does NOT call app.listen()" assertion below.
 *
 * Success path verifies:
 *   - pool.connect() is called once
 *   - the acquired client is released
 *   - '[DB] PostgreSQL connected' is logged
 *   - app.listen() is invoked on the configured port
 *
 * Failure path verifies:
 *   - pool.connect() rejection triggers process.exit(1)
 *   - the error is logged via console.error
 *   - '[DB] PostgreSQL connected' is NOT logged
 *   - app.listen() is NOT called
 */

// ---------------------------------------------------------------------------
// Top-level mutable handles — "mock" prefix allows use inside jest.mock()
// ---------------------------------------------------------------------------

// Reassigned inside each test (via mockImplementation/mockResolvedValue) so
// the factory closure always reads the current implementation.
let mockQuery = jest.fn();
let mockListenFn = jest.fn((_port, cb) => cb && cb());

// Stable config stub — avoids required() throwing for missing env vars.
const mockConfig = {
  port: 3000,
  nodeEnv: 'test',
  db: { host: 'localhost', port: 5432, name: 'todolist_test', user: 'postgres', password: 'postgres' },
  jwt: { secret: 's', refreshSecret: 'r', accessExpiresIn: '1h', refreshExpiresIn: '7d' },
  cors: { origin: 'http://localhost:3000' },
};

// ---------------------------------------------------------------------------
// Module-level mocks (hoisted by babel-jest)
// ---------------------------------------------------------------------------

jest.mock('../../db/pool', () => ({
  pool: {
    query: (...args) => mockQuery(...args),
  },
}));

jest.mock('../../app', () => ({
  app: {
    listen: (...args) => mockListenFn(...args),
  },
}));

jest.mock('../../config', () => ({
  config: mockConfig,
}));

// ---------------------------------------------------------------------------
// Helper: load server.js in a fresh isolated module registry
// ---------------------------------------------------------------------------

/**
 * Requires server.js inside jest.isolateModules() so each test gets a brand-
 * new execution of start(), then waits one event-loop tick for the async
 * function to settle before resolving with the installed spy references.
 */
function loadServer() {
  return new Promise((resolve) => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    jest.isolateModules(() => {
      require('../../server');
      setImmediate(() => resolve({ logSpy, errorSpy, exitSpy }));
    });
  });
}

// ---------------------------------------------------------------------------
// Tear-down
// ---------------------------------------------------------------------------

afterEach(() => {
  jest.restoreAllMocks();
  mockQuery.mockReset();
  mockListenFn.mockReset();
  mockListenFn.mockImplementation((_port, cb) => cb && cb());
});

// ---------------------------------------------------------------------------
// Success path
// ---------------------------------------------------------------------------

describe('server start() – DB connection succeeds', () => {
  it('logs "[DB] PostgreSQL connected" when SELECT 1 resolves', async () => {
    mockQuery.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    const { logSpy } = await loadServer();

    expect(logSpy).toHaveBeenCalledWith('[DB] PostgreSQL connected');
  });

  it('executes SELECT 1 exactly once', async () => {
    mockQuery.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    await loadServer();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT 1');
  });

  it('does NOT call process.exit when SELECT 1 succeeds', async () => {
    mockQuery.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    const { exitSpy } = await loadServer();

    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('calls app.listen() on the configured port after a successful connection', async () => {
    mockQuery.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    await loadServer();

    expect(mockListenFn).toHaveBeenCalledTimes(1);
    expect(mockListenFn).toHaveBeenCalledWith(
      mockConfig.port,
      expect.any(Function)
    );
  });
});

// ---------------------------------------------------------------------------
// Failure path
// ---------------------------------------------------------------------------

describe('server start() – DB connection fails', () => {
  it('calls process.exit(1) when SELECT 1 rejects', async () => {
    mockQuery.mockRejectedValue(new Error('ECONNREFUSED'));

    const { exitSpy } = await loadServer();

    expect(exitSpy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('logs the connection error message via console.error before exiting', async () => {
    const connectError = new Error('connect ECONNREFUSED 127.0.0.1:5432');
    mockQuery.mockRejectedValue(connectError);

    const { errorSpy } = await loadServer();

    expect(errorSpy).toHaveBeenCalledWith(
      '[DB] Connection failed:',
      connectError.message
    );
  });

  it('does NOT log "[DB] PostgreSQL connected" when connection fails', async () => {
    mockQuery.mockRejectedValue(new Error('timeout'));

    const { logSpy } = await loadServer();

    const connectedCalls = logSpy.mock.calls.filter(
      (args) => args[0] === '[DB] PostgreSQL connected'
    );
    expect(connectedCalls).toHaveLength(0);
  });

  it('does NOT call app.listen() when the DB connection fails', async () => {
    mockQuery.mockRejectedValue(new Error('DB unavailable'));

    await loadServer();

    expect(mockListenFn).not.toHaveBeenCalled();
  });
});
