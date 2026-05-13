const { app } = require('./app');
const { config } = require('./config');
const { pool } = require('./db/pool');

async function start() {
  try {
    const client = await pool.connect();
    client.release();
    console.log('[DB] PostgreSQL connected');
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`[SERVER] Running on port ${config.port} (${config.nodeEnv})`);
  });
}

start();
