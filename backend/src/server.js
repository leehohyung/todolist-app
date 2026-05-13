const { app } = require('./app');
const { config } = require('./config');
const { pool } = require('./db/pool');

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('[DB] PostgreSQL connected');
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
    return; // guard: ensures nothing below executes when process.exit is mocked
  }

  app.listen(config.port, () => {
    console.log(`[SERVER] Running on port ${config.port} (${config.nodeEnv})`);
  });
}

start();
