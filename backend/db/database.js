const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL Neon');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no PostgreSQL:', err);
});

// Inicializar tabelas
async function initDatabase() {
  try {
    const initSql = `
      -- Tabela de usuários
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          points INTEGER DEFAULT 3,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de histórico de partidas
      CREATE TABLE IF NOT EXISTS game_history (
          id SERIAL PRIMARY KEY,
          player1_id INTEGER REFERENCES users(id),
          player2_id INTEGER REFERENCES users(id),
          game_type VARCHAR(20) NOT NULL,
          winner_id INTEGER REFERENCES users(id),
          points_exchanged INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de saques
      CREATE TABLE IF NOT EXISTS withdrawals (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          amount INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_game_history_player1 ON game_history(player1_id);
      CREATE INDEX IF NOT EXISTS idx_game_history_player2 ON game_history(player2_id);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
    `;
    
    await pool.query(initSql);
    console.log('✅ Tabelas inicializadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  }
}

module.exports = { pool, initDatabase };

