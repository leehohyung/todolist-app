'use strict';

/**
 * Tests for src/db/pool.js
 *
 * Strategy:
 *   - Integration: connects to the real `todolist_test` database configured
 *     via the DB_NAME env override so the pool module picks up the test DB.
 *   - Unit: verifies the error-event handler path by emitting a fake error on
 *     the pool without involving a real connection.
 *
 * Run with:
 *   DB_NAME=todolist_test npx jest --runInBand src/db/__tests__/pool.test.js
 */

// Override DB_NAME before any module is loaded so pool.js connects to the
// test database instead of the development database.
process.env.DB_NAME = 'todolist_test';

// References populated in beforeAll after a clean module reset.
let pool;
let Pool;

beforeAll(() => {
  // Reset the module registry so pool.js is re-evaluated with the overridden
  // DB_NAME value rather than whatever was cached by a previous test file.
  jest.resetModules();

  // Require both pg.Pool and the pool module from the SAME freshly-loaded
  // registry so the instanceof check uses the identical constructor reference.
  Pool = require('pg').Pool;
  ({ pool } = require('../pool'));
});

afterAll(async () => {
  // Drain the connection pool so Jest can exit cleanly.
  await pool.end();
});

// ---------------------------------------------------------------------------
// Export contract
// ---------------------------------------------------------------------------

describe('pool module – export shape', () => {
  it('exports an object with a `pool` property', () => {
    // Re-require from cache (same registry as beforeAll) — just validates shape.
    const mod = require('../pool');
    expect(mod).toHaveProperty('pool');
  });

  it('`pool` is an instance of pg.Pool', () => {
    expect(pool).toBeInstanceOf(Pool);
  });
});

// ---------------------------------------------------------------------------
// Real-database integration
// ---------------------------------------------------------------------------

describe('pool – real database connectivity (todolist_test)', () => {
  it('can acquire a client from the pool', async () => {
    const client = await pool.connect();
    expect(client).toBeDefined();
    client.release();
  });

  it('executes `SELECT 1` and returns the expected result', async () => {
    const result = await pool.query('SELECT 1 AS value');

    expect(result).toHaveProperty('rows');
    expect(result.rows).toHaveLength(1);
    // pg returns integer literals as JS numbers.
    expect(result.rows[0]).toEqual({ value: 1 });
  });

  it('returns the correct rowCount for a `SELECT 1` query', async () => {
    const result = await pool.query('SELECT 1');
    expect(result.rowCount).toBe(1);
  });

  it('acquired client can execute queries independently', async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT 1 AS ping');
      expect(result.rows[0]).toEqual({ ping: 1 });
    } finally {
      client.release();
    }
  });
});

// ---------------------------------------------------------------------------
// Error-event handler
// ---------------------------------------------------------------------------

describe('pool – error event handler', () => {
  it('logs to console.error when the pool emits an error event', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const fakeError = new Error('idle client error simulation');
    // Emit directly on the pool; the registered listener should fire.
    pool.emit('error', fakeError);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      'PostgreSQL pool error:',
      fakeError.message
    );

    consoleSpy.mockRestore();
  });

  it('does not throw when the error event is emitted (handler is registered)', () => {
    // If no listener were registered, EventEmitter would throw for 'error'
    // events. This assertion confirms the listener is in place.
    // Suppress the console.error output so it does not pollute test output.
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      pool.emit('error', new Error('safe emit test'));
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
