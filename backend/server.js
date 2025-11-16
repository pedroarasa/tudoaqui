const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const { initDatabase } = require('./db/database');
const { router: authRouter } = require('./routes/auth');
const gamesRouter = require('./routes/games');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

require('dotenv').config();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
// Tentar múltiplos caminhos possíveis (para funcionar em diferentes ambientes)
const possiblePaths = [
  path.join(__dirname, 'public'),                // Frontend copiado para backend/public (build)
  path.join(__dirname, '../frontend'),           // Desenvolvimento local (backend/frontend)
  path.join(__dirname, '../../frontend'),        // Render (se backend está em src/backend)
  path.join(process.cwd(), 'frontend'),          // Render (cwd/frontend)
  path.join(process.cwd(), '../frontend'),       // Render (cwd/../frontend)
  path.resolve(__dirname, '../../frontend'),     // Render (caminho absoluto)
  path.resolve(process.cwd(), 'frontend'),       // Render (caminho absoluto do cwd)
  path.resolve(process.cwd(), '../frontend'),    // Render (caminho absoluto relativo)
  '/opt/render/project/src/frontend',            // Render (caminho absoluto específico)
  '/opt/render/project/frontend',                // Render (caminho absoluto raiz)
];

// Se __dirname contém 'backend', tentar caminho relativo
if (__dirname.includes('backend')) {
  possiblePaths.unshift(path.join(__dirname, '../frontend'));
}

let frontendPath = null;
console.log('🔍 Procurando frontend...');
console.log('📂 __dirname:', __dirname);
console.log('📂 process.cwd():', process.cwd());

// Função auxiliar para listar diretórios recursivamente (limitado a 2 níveis)
function listDirectories(dir, maxDepth = 2, currentDepth = 0) {
  const dirs = [];
  try {
    if (currentDepth >= maxDepth) return dirs;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        const fullPath = path.join(dir, item.name);
        dirs.push(fullPath);
        if (currentDepth < maxDepth - 1) {
          dirs.push(...listDirectories(fullPath, maxDepth, currentDepth + 1));
        }
      }
    }
  } catch (e) {
    // Ignorar erros de leitura
  }
  return dirs;
}

for (const testPath of possiblePaths) {
  const exists = fs.existsSync(testPath);
  const hasIndex = exists && fs.existsSync(path.join(testPath, 'index.html'));
  console.log(`   Testando: ${testPath} - ${exists ? 'existe' : 'não existe'} ${hasIndex ? '✅ tem index.html' : ''}`);
  
  if (exists && hasIndex) {
    frontendPath = testPath;
    console.log('✅ Caminho do frontend encontrado:', frontendPath);
    break;
  }
}

// Se não encontrou, procurar recursivamente a partir do diretório atual e pai
if (!frontendPath) {
  console.log('🔍 Procurando recursivamente...');
  const searchDirs = [__dirname, path.join(__dirname, '..'), process.cwd()];
  
  for (const searchDir of searchDirs) {
    try {
      if (fs.existsSync(searchDir)) {
        const dirs = listDirectories(searchDir);
        for (const dir of dirs) {
          if (fs.existsSync(path.join(dir, 'index.html'))) {
            // Verificar se parece ser o frontend (tem index.html e outros arquivos esperados)
            const hasAppJs = fs.existsSync(path.join(dir, 'app.js')) || fs.existsSync(path.join(dir, 'styles.css'));
            if (hasAppJs || dir.includes('frontend')) {
              frontendPath = dir;
              console.log('✅ Frontend encontrado recursivamente:', frontendPath);
              break;
            }
          }
        }
        if (frontendPath) break;
      }
    } catch (e) {
      console.log(`   Erro ao procurar em ${searchDir}:`, e.message);
    }
  }
}

if (frontendPath) {
  app.use(express.static(frontendPath));
  console.log(`✅ Frontend configurado para servir de: ${frontendPath}`);
} else {
  console.error('❌ Diretório frontend não encontrado!');
  console.log('📂 Diretório atual (__dirname):', __dirname);
  console.log('📂 Diretório de trabalho (cwd):', process.cwd());
  console.log('🔍 Tentou os seguintes caminhos:');
  possiblePaths.forEach(p => {
    const exists = fs.existsSync(p);
    console.log(`   - ${p} ${exists ? '✅ existe' : '❌ não existe'}`);
  });
  
  // Listar conteúdo do diretório atual para debug
  try {
    const dirContents = fs.readdirSync(__dirname);
    console.log('📁 Conteúdo do diretório atual:', dirContents);
  } catch (e) {
    console.log('❌ Erro ao ler diretório:', e.message);
  }
  
  try {
    const parentContents = fs.readdirSync(path.join(__dirname, '..'));
    console.log('📁 Conteúdo do diretório pai:', parentContents);
  } catch (e) {
    console.log('❌ Erro ao ler diretório pai:', e.message);
  }
  
  // Tentar listar estrutura completa para debug
  try {
    console.log('🔍 Estrutura de diretórios encontrada:');
    const rootDir = process.cwd();
    const allDirs = listDirectories(rootDir, 3);
    allDirs.forEach(dir => {
      const relativePath = path.relative(rootDir, dir);
      const hasIndex = fs.existsSync(path.join(dir, 'index.html'));
      if (hasIndex || dir.includes('frontend')) {
        console.log(`   📁 ${relativePath} ${hasIndex ? '✅ tem index.html' : ''}`);
      }
    });
  } catch (e) {
    console.log('❌ Erro ao listar estrutura:', e.message);
  }
}

// Rotas da API (devem vir antes da rota catch-all)
app.use('/api/auth', authRouter);
app.use('/api/games', gamesRouter);

// Rota catch-all: servir index.html para todas as rotas que não sejam da API
// Isso permite que o frontend funcione com roteamento client-side
app.get('*', (req, res, next) => {
  // Ignorar requisições para a API
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  if (frontendPath) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(500).send('Frontend não encontrado. Verifique os logs do servidor.');
  }
});

// Salas de jogo
const waitingRooms = {
  memory: [],
  clickRace: []
};

const activeGames = new Map();

// Função para calcular dificuldade baseada em pontos
function getDifficultyMultiplier(points) {
  if (points < 10) return 1.0;
  if (points < 50) return 1.2;
  if (points < 100) return 1.5;
  if (points < 200) return 1.8;
  return 2.0;
}

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('join-room', async ({ userId, username, gameType, points }) => {
    try {
      const room = waitingRooms[gameType];
      
      if (!room) {
        socket.emit('error', { message: 'Tipo de jogo inválido' });
        return;
      }

      // Remover de outras salas
      Object.keys(waitingRooms).forEach(type => {
        waitingRooms[type] = waitingRooms[type].filter(p => p.socketId !== socket.id);
      });

      // Adicionar à sala
      const player = { socketId: socket.id, userId, username, points };
      room.push(player);
      socket.join(`waiting-${gameType}`);

      socket.emit('room-joined', { gameType });

      // Verificar se há outro jogador esperando
      if (room.length >= 2) {
        const [player1, player2] = room.splice(0, 2);
        
        const gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const difficulty1 = getDifficultyMultiplier(player1.points);
        const difficulty2 = getDifficultyMultiplier(player2.points);

        const gameData = {
          id: gameId,
          gameType,
          players: [
            { ...player1, difficulty: difficulty1 },
            { ...player2, difficulty: difficulty2 }
          ],
          state: 'waiting',
          createdAt: Date.now()
        };

        activeGames.set(gameId, gameData);

        // Criar sala do jogo para ambos os jogadores
        const player1Socket = io.sockets.sockets.get(player1.socketId);
        const player2Socket = io.sockets.sockets.get(player2.socketId);
        if (player1Socket) player1Socket.join(gameId);
        if (player2Socket) player2Socket.join(gameId);

        // Notificar ambos os jogadores
        io.to(player1.socketId).emit('match-found', {
          gameId,
          opponent: { userId: player2.userId, username: player2.username, points: player2.points },
          difficulty: difficulty1
        });

        io.to(player2.socketId).emit('match-found', {
          gameId,
          opponent: { userId: player1.userId, username: player1.username, points: player1.points },
          difficulty: difficulty2
        });

        // Remover da sala de espera
        io.socketsLeave(`waiting-${gameType}`);
      }
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      socket.emit('error', { message: 'Erro ao entrar na sala' });
    }
  });

  socket.on('leave-room', ({ gameType }) => {
    if (waitingRooms[gameType]) {
      waitingRooms[gameType] = waitingRooms[gameType].filter(p => p.socketId !== socket.id);
    }
    socket.leave(`waiting-${gameType}`);
  });

  socket.on('game-ready', ({ gameId }) => {
    const game = activeGames.get(gameId);
    if (!game) return;

    socket.join(gameId);

    if (!game.readyPlayers) {
      game.readyPlayers = new Set();
    }

    game.readyPlayers.add(socket.id);

    if (game.readyPlayers.size === 2) {
      game.state = 'playing';
      
      // Inicializar jogo baseado no tipo
      if (game.gameType === 'memory') {
        game.memoryState = initializeMemoryGame(game.players);
      } else if (game.gameType === 'clickRace') {
        game.clickRaceState = initializeClickRaceGame(game.players);
      }

      io.to(gameId).emit('game-start', {
        gameType: game.gameType,
        gameState: game.gameType === 'memory' ? game.memoryState : game.clickRaceState
      });
    }
  });

  socket.on('game-action', ({ gameId, action, data }) => {
    const game = activeGames.get(gameId);
    if (!game || game.state !== 'playing') return;

    const player = game.players.find(p => p.socketId === socket.id);
    if (!player) return;

    if (game.gameType === 'memory') {
      handleMemoryAction(game, player, action, data, io);
    } else if (game.gameType === 'clickRace') {
      handleClickRaceAction(game, player, action, data, io);
    }
  });

  socket.on('disconnect', () => {
    // Remover de salas de espera
    Object.keys(waitingRooms).forEach(type => {
      waitingRooms[type] = waitingRooms[type].filter(p => p.socketId !== socket.id);
    });

    // Remover de jogos ativos
    for (const [gameId, game] of activeGames.entries()) {
      if (game.players.some(p => p.socketId === socket.id)) {
        const opponent = game.players.find(p => p.socketId !== socket.id);
        if (opponent) {
          io.to(opponent.socketId).emit('opponent-disconnected');
        }
        activeGames.delete(gameId);
      }
    }
  });
});

function initializeMemoryGame(players) {
  const cards = [];
  const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];
  
  // Criar pares de cartas
  for (let i = 0; i < 8; i++) {
    cards.push({ id: i * 2, symbol: symbols[i], flipped: false, matched: false });
    cards.push({ id: i * 2 + 1, symbol: symbols[i], flipped: false, matched: false });
  }

  // Embaralhar
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return {
    cards,
    currentPlayer: 0,
    flippedCards: [],
    scores: [0, 0],
    turnStartTime: Date.now()
  };
}

function initializeClickRaceGame(players) {
  const targetClicks = Math.floor(50 * Math.max(players[0].difficulty, players[1].difficulty));
  
  return {
    targetClicks,
    clicks: [0, 0],
    startTime: Date.now(),
    finished: [false, false]
  };
}

function handleMemoryAction(game, player, action, data, io) {
  const playerIndex = game.players.findIndex(p => p.socketId === player.socketId);
  
  if (action === 'flip-card') {
    // Verificar se é a vez do jogador
    if (game.memoryState.currentPlayer !== playerIndex) {
      return;
    }
    
    const { cardId } = data;
    const card = game.memoryState.cards.find(c => c.id === cardId);
    
    if (!card || card.flipped || card.matched || game.memoryState.flippedCards.length >= 2) {
      return;
    }

    card.flipped = true;
    game.memoryState.flippedCards.push(cardId);

    io.to(game.id).emit('game-update', {
      action: 'card-flipped',
      cardId,
      playerIndex
    });

    if (game.memoryState.flippedCards.length === 2) {
      setTimeout(() => {
        const [id1, id2] = game.memoryState.flippedCards;
        const card1 = game.memoryState.cards.find(c => c.id === id1);
        const card2 = game.memoryState.cards.find(c => c.id === id2);

        if (card1.symbol === card2.symbol) {
          // Par encontrado - jogador continua
          card1.matched = true;
          card2.matched = true;
          game.memoryState.scores[playerIndex]++;
          
          io.to(game.id).emit('game-update', {
            action: 'cards-matched',
            cardIds: [id1, id2],
            playerIndex,
            scores: game.memoryState.scores
          });

          game.memoryState.flippedCards = [];

          // Verificar vitória
          const allMatched = game.memoryState.cards.every(c => c.matched);
          if (allMatched) {
            const winnerIndex = game.memoryState.scores[0] > game.memoryState.scores[1] ? 0 : 
                               game.memoryState.scores[1] > game.memoryState.scores[0] ? 1 : -1;
            
            game.state = 'finished';
            const winnerId = winnerIndex >= 0 ? game.players[winnerIndex].userId : null;
            const loserId = winnerIndex >= 0 ? game.players[1 - winnerIndex].userId : null;
            
            io.to(game.id).emit('game-end', {
              winner: winnerId,
              loser: loserId,
              scores: game.memoryState.scores,
              players: game.players.map(p => ({ userId: p.userId, username: p.username }))
            });
            
            activeGames.delete(game.id);
            return;
          }
        } else {
          // Par não encontrado - muda turno
          card1.flipped = false;
          card2.flipped = false;
          
          io.to(game.id).emit('game-update', {
            action: 'cards-flip-back',
            cardIds: [id1, id2]
          });

          game.memoryState.flippedCards = [];
          game.memoryState.currentPlayer = 1 - game.memoryState.currentPlayer;
          
          io.to(game.id).emit('game-update', {
            action: 'turn-change',
            currentPlayer: game.memoryState.currentPlayer
          });
        }
      }, 1000);
    }
  }
}

function handleClickRaceAction(game, player, action, data, io) {
  const playerIndex = game.players.findIndex(p => p.socketId === player.socketId);
  
  if (action === 'click') {
    if (game.clickRaceState.finished[playerIndex]) return;
    
    game.clickRaceState.clicks[playerIndex]++;
    
    io.to(game.id).emit('game-update', {
      action: 'click',
      playerIndex,
      clicks: game.clickRaceState.clicks
    });

    if (game.clickRaceState.clicks[playerIndex] >= game.clickRaceState.targetClicks) {
      game.clickRaceState.finished[playerIndex] = true;
      
      const winnerIndex = playerIndex;
      game.state = 'finished';
      const winnerId = game.players[winnerIndex].userId;
      const loserId = game.players[1 - winnerIndex].userId;
      
      io.to(game.id).emit('game-end', {
        winner: winnerId,
        loser: loserId,
        clicks: game.clickRaceState.clicks,
        players: game.players.map(p => ({ userId: p.userId, username: p.username }))
      });
      
      activeGames.delete(game.id);
    }
  }
}

// Inicializar banco de dados
initDatabase().then(() => {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📁 Servindo arquivos estáticos de: ${path.join(__dirname, '../frontend')}`);
  });
}).catch((error) => {
  console.error('❌ Erro ao inicializar banco de dados:', error);
  process.exit(1);
});

