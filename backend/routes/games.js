const express = require('express');
const { pool } = require('../db/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Obter pontos do usuário
router.get('/points', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT points FROM users WHERE id = $1',
      [req.user.userId]
    );
    res.json({ points: result.rows[0].points });
  } catch (error) {
    console.error('Erro ao buscar pontos:', error);
    res.status(500).json({ error: 'Erro ao buscar pontos' });
  }
});

// Obter histórico de partidas
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gh.*, 
              u1.username as player1_username,
              u2.username as player2_username,
              winner.username as winner_username
       FROM game_history gh
       LEFT JOIN users u1 ON gh.player1_id = u1.id
       LEFT JOIN users u2 ON gh.player2_id = u2.id
       LEFT JOIN users winner ON gh.winner_id = winner.id
       WHERE gh.player1_id = $1 OR gh.player2_id = $1
       ORDER BY gh.created_at DESC
       LIMIT 20`,
      [req.user.userId]
    );
    res.json({ history: result.rows });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

// Registrar resultado de partida
router.post('/result', authenticateToken, async (req, res) => {
  try {
    const { opponentId, gameType, won, opponentPoints } = req.body;

    if (!opponentId || !gameType) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Buscar pontos atuais
      const userResult = await client.query('SELECT points FROM users WHERE id = $1', [req.user.userId]);
      const opponentResult = await client.query('SELECT points FROM users WHERE id = $1', [opponentId]);

      if (userResult.rows.length === 0 || opponentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      let pointsExchanged = 0;
      let winnerId = null;

      if (won) {
        // Ganhador recebe os pontos do adversário
        const pointsToGain = opponentResult.rows[0].points;
        pointsExchanged = pointsToGain;
        winnerId = req.user.userId;

        // Atualizar pontos
        await client.query(
          'UPDATE users SET points = points + $1 WHERE id = $2',
          [pointsToGain, req.user.userId]
        );
        await client.query(
          'UPDATE users SET points = GREATEST(0, points - $1) WHERE id = $2',
          [pointsToGain, opponentId]
        );
      } else {
        // Perdedor perde seus pontos
        const pointsToLose = userResult.rows[0].points;
        pointsExchanged = pointsToLose;
        winnerId = opponentId;

        await client.query(
          'UPDATE users SET points = GREATEST(0, points - $1) WHERE id = $2',
          [pointsToLose, req.user.userId]
        );
        await client.query(
          'UPDATE users SET points = points + $1 WHERE id = $2',
          [pointsToLose, opponentId]
        );
      }

      // Registrar no histórico
      await client.query(
        `INSERT INTO game_history (player1_id, player2_id, game_type, winner_id, points_exchanged)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.userId, opponentId, gameType, winnerId, pointsExchanged]
      );

      await client.query('COMMIT');

      // Buscar pontos atualizados
      const updatedUser = await pool.query('SELECT points FROM users WHERE id = $1', [req.user.userId]);

      res.json({
        success: true,
        pointsExchanged,
        newPoints: updatedUser.rows[0].points
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao registrar resultado:', error);
    res.status(500).json({ error: 'Erro ao registrar resultado' });
  }
});

// Adicionar ponto por entrar em sala
router.post('/room-entry', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE users SET points = points + 1 WHERE id = $1',
      [req.user.userId]
    );

    const result = await pool.query('SELECT points FROM users WHERE id = $1', [req.user.userId]);
    res.json({ points: result.rows[0].points });
  } catch (error) {
    console.error('Erro ao adicionar ponto:', error);
    res.status(500).json({ error: 'Erro ao adicionar ponto' });
  }
});

// Solicitar saque
router.post('/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Valor mínimo de saque é 50 pontos' });
    }

    const result = await pool.query('SELECT points FROM users WHERE id = $1', [req.user.userId]);
    const currentPoints = result.rows[0].points;

    if (currentPoints < amount) {
      return res.status(400).json({ error: 'Pontos insuficientes' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Deduzir pontos
      await client.query(
        'UPDATE users SET points = points - $1 WHERE id = $2',
        [amount, req.user.userId]
      );

      // Registrar saque
      await client.query(
        'INSERT INTO withdrawals (user_id, amount, status) VALUES ($1, $2, $3)',
        [req.user.userId, amount, 'pending']
      );

      await client.query('COMMIT');

      const updatedResult = await pool.query('SELECT points FROM users WHERE id = $1', [req.user.userId]);

      res.json({
        success: true,
        message: 'Saque solicitado com sucesso',
        newPoints: updatedResult.rows[0].points
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao processar saque:', error);
    res.status(500).json({ error: 'Erro ao processar saque' });
  }
});

module.exports = router;

