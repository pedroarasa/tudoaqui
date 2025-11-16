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

// Inicializar tabelas - APAGA E RECRIA AUTOMATICAMENTE
async function initDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    // APAGAR TABELAS ANTIGAS (em ordem para evitar problemas de foreign key)
    const dropSql = `
      DROP TABLE IF EXISTS withdrawals CASCADE;
      DROP TABLE IF EXISTS game_history CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;
    
    await pool.query(dropSql);
    console.log('🗑️  Tabelas antigas removidas');
    
    // CRIAR TABELAS NOVAS
    const createSql = `
      -- Tabela de usuários
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          points INTEGER DEFAULT 3,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de histórico de partidas
      CREATE TABLE game_history (
          id SERIAL PRIMARY KEY,
          player1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          player2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          game_type VARCHAR(20) NOT NULL,
          winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          points_exchanged INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de saques
      CREATE TABLE withdrawals (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          amount INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para melhor performance
      CREATE INDEX idx_users_username ON users(username);
      CREATE INDEX idx_game_history_player1 ON game_history(player1_id);
      CREATE INDEX idx_game_history_player2 ON game_history(player2_id);
      CREATE INDEX idx_game_history_winner ON game_history(winner_id);
      CREATE INDEX idx_withdrawals_user ON withdrawals(user_id);
    `;
    
    await pool.query(createSql);
    console.log('✅ Tabelas criadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase };

