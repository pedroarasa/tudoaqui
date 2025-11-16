// Detectar URL da API automaticamente (funciona em localhost e Render)
const API_URL = window.location.origin + '/api';
const SOCKET_URL = window.location.origin;
let socket = null;
let currentUser = null;
let currentGame = null;
let currentGameType = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupAuthTabs();
});

function setupAuthTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
            document.getElementById(`${tabName}-form`).classList.add('active');
        });
    });
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showScreen('auth-screen');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showMainScreen();
        } else {
            localStorage.removeItem('token');
            showScreen('auth-screen');
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showScreen('auth-screen');
    }
}

async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const errorEl = document.getElementById('register-error');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showMainScreen();
        } else {
            errorEl.textContent = data.error || 'Erro ao registrar';
            errorEl.classList.add('show');
        }
    } catch (error) {
        errorEl.textContent = 'Erro de conexão';
        errorEl.classList.add('show');
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('auth-error');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showMainScreen();
        } else {
            errorEl.textContent = data.error || 'Credenciais inválidas';
            errorEl.classList.add('show');
        }
    } catch (error) {
        errorEl.textContent = 'Erro de conexão';
        errorEl.classList.add('show');
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    showScreen('auth-screen');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showMainScreen() {
    showScreen('main-screen');
    updateUserInfo();
    loadStats();
    initSocket();
}

function updateUserInfo() {
    document.getElementById('username-display').textContent = currentUser.username;
    document.getElementById('points-display').textContent = `${currentUser.points} pontos`;
    document.getElementById('stat-points').textContent = currentUser.points;
}

async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        const [pointsRes, historyRes] = await Promise.all([
            fetch(`${API_URL}/games/points`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/games/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (pointsRes.ok) {
            const pointsData = await pointsRes.json();
            currentUser.points = pointsData.points;
            updateUserInfo();
        }

        if (historyRes.ok) {
            const historyData = await historyRes.json();
            document.getElementById('stat-games').textContent = historyData.history.length;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

function initSocket() {
    if (socket) {
        socket.disconnect();
    }

    socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('Conectado ao servidor');
    });

    socket.on('room-joined', () => {
        console.log('Entrou na sala de espera');
    });

    socket.on('match-found', ({ gameId, opponent, difficulty }) => {
        currentGame = gameId;
        document.querySelector('.waiting-content h2').textContent = `Partida encontrada!`;
        document.querySelector('.waiting-content p').textContent = `Oponente: ${opponent.username} (${opponent.points} pontos)`;
        
        // Adicionar ponto por entrar na sala
        addRoomEntryPoint();
        
        // Notificar que está pronto
        setTimeout(() => {
            socket.emit('game-ready', { gameId });
        }, 1000);
    });

    socket.on('game-start', ({ gameType, gameState }) => {
        document.getElementById('waiting-room').classList.add('hidden');
        currentGameType = gameType;
        
        if (gameType === 'memory') {
            startMemoryGame(gameState);
        } else if (gameType === 'clickRace') {
            startClickRaceGame(gameState);
        }
    });

    socket.on('game-update', (update) => {
        if (currentGameType === 'memory') {
            handleMemoryUpdate(update);
        } else if (currentGameType === 'clickRace') {
            handleClickRaceUpdate(update);
        }
    });

    socket.on('game-end', async ({ winner, loser, scores, clicks, players }) => {
        const won = winner === currentUser.id;
        const opponentId = won ? loser : winner;
        
        if (currentGameType === 'memory') {
            alert(won ? '🎉 Você venceu!' : '😢 Você perdeu!');
        } else if (currentGameType === 'clickRace') {
            alert(won ? '🎉 Você venceu!' : '😢 Você perdeu!');
        }

        // Registrar resultado
        if (opponentId) {
            await registerGameResult(opponentId, won);
        }
        
        // Resetar
        resetGame();
        loadStats();
    });

    socket.on('opponent-disconnected', () => {
        alert('Oponente desconectado. Partida cancelada.');
        resetGame();
    });

    socket.on('error', ({ message }) => {
        alert(`Erro: ${message}`);
        resetGame();
    });
}

async function addRoomEntryPoint() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/games/room-entry`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser.points = data.points;
            updateUserInfo();
        }
    } catch (error) {
        console.error('Erro ao adicionar ponto:', error);
    }
}

function selectGame(gameType) {
    if (!socket || !socket.connected) {
        alert('Erro de conexão. Recarregue a página.');
        return;
    }

    currentGameType = gameType;
    document.querySelector('.dashboard').classList.add('hidden');
    document.getElementById('waiting-room').classList.remove('hidden');
    
    socket.emit('join-room', {
        userId: currentUser.id,
        username: currentUser.username,
        gameType: gameType,
        points: currentUser.points
    });
}

function cancelMatchmaking() {
    if (socket && currentGameType) {
        socket.emit('leave-room', { gameType: currentGameType });
    }
    document.getElementById('waiting-room').classList.add('hidden');
    document.querySelector('.dashboard').classList.remove('hidden');
    currentGameType = null;
}

function resetGame() {
    document.getElementById('waiting-room').classList.add('hidden');
    document.getElementById('memory-game').classList.add('hidden');
    document.getElementById('click-race-game').classList.add('hidden');
    document.querySelector('.dashboard').classList.remove('hidden');
    currentGame = null;
    currentGameType = null;
}

// Memory Game
function startMemoryGame(gameState) {
    document.getElementById('memory-game').classList.remove('hidden');
    const board = document.getElementById('memory-board');
    board.innerHTML = '';

    gameState.cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'memory-card';
        cardEl.dataset.cardId = card.id;
        cardEl.dataset.symbol = card.symbol;
        cardEl.addEventListener('click', () => flipCard(card.id));
        board.appendChild(cardEl);
    });

    updateMemoryScores(gameState.scores);
    updateTurnIndicator(gameState.currentPlayer);
}

function flipCard(cardId) {
    if (!currentGame) return;
    
    socket.emit('game-action', {
        gameId: currentGame,
        action: 'flip-card',
        data: { cardId: parseInt(cardId) }
    });
}

function handleMemoryUpdate(update) {
    if (update.action === 'card-flipped') {
        const card = document.querySelector(`[data-card-id="${update.cardId}"]`);
        if (card) {
            card.classList.add('flipped');
            card.textContent = card.dataset.symbol;
        }
    } else if (update.action === 'cards-matched') {
        update.cardIds.forEach(id => {
            const card = document.querySelector(`[data-card-id="${id}"]`);
            if (card) {
                card.classList.add('matched');
            }
        });
        updateMemoryScores(update.scores);
    } else if (update.action === 'cards-flip-back') {
        update.cardIds.forEach(id => {
            const card = document.querySelector(`[data-card-id="${id}"]`);
            if (card) {
                card.classList.remove('flipped');
                card.textContent = '';
            }
        });
    } else if (update.action === 'turn-change') {
        updateTurnIndicator(update.currentPlayer);
    }
}

function updateMemoryScores(scores) {
    document.getElementById('memory-score-0').textContent = scores[0];
    document.getElementById('memory-score-1').textContent = scores[1];
}

function updateTurnIndicator(currentPlayer) {
    const indicator = document.getElementById('memory-turn-indicator');
    indicator.textContent = currentPlayer === 0 ? 'Sua vez!' : 'Vez do oponente';
    indicator.style.color = currentPlayer === 0 ? '#27ae60' : '#e74c3c';
}

// Click Race Game
let raceTarget = 0;
let raceClicks = [0, 0];

function startClickRaceGame(gameState) {
    document.getElementById('click-race-game').classList.remove('hidden');
    raceTarget = gameState.targetClicks;
    raceClicks = [0, 0];
    
    document.getElementById('race-target').textContent = raceTarget;
    document.getElementById('race-clicks-0').textContent = '0';
    document.getElementById('race-clicks-1').textContent = '0';
    
    const clickButton = document.getElementById('click-button');
    clickButton.disabled = false;
    clickButton.textContent = 'CLIQUE AQUI!';
    
    updateRaceProgress();
}

function handleClick() {
    if (!currentGame || !socket) return;
    
    socket.emit('game-action', {
        gameId: currentGame,
        action: 'click',
        data: {}
    });
}

function handleClickRaceUpdate(update) {
    if (update.action === 'click') {
        raceClicks = update.clicks;
        document.getElementById('race-clicks-0').textContent = raceClicks[0];
        document.getElementById('race-clicks-1').textContent = raceClicks[1];
        updateRaceProgress();
    }
}

function updateRaceProgress() {
    const progress = (raceClicks[0] / raceTarget) * 100;
    document.getElementById('progress-player').style.width = `${Math.min(progress, 100)}%`;
}

// Game Result
async function registerGameResult(opponentId, won) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/games/result`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                opponentId: opponentId,
                gameType: currentGameType,
                won: won,
                opponentPoints: 0 // Será calculado no backend
            })
        });

        if (response.ok) {
            const data = await response.json();
            currentUser.points = data.newPoints;
            updateUserInfo();
        }
    } catch (error) {
        console.error('Erro ao registrar resultado:', error);
    }
}

// Withdraw
function showWithdraw() {
    document.getElementById('withdraw-modal').classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

async function processWithdraw() {
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    const errorEl = document.getElementById('withdraw-error');

    if (!amount || amount < 50) {
        errorEl.textContent = 'Valor mínimo é 50 pontos';
        errorEl.classList.add('show');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/games/withdraw`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Saque solicitado com sucesso!');
            currentUser.points = data.newPoints;
            updateUserInfo();
            closeModal('withdraw-modal');
            document.getElementById('withdraw-amount').value = '';
        } else {
            errorEl.textContent = data.error || 'Erro ao processar saque';
            errorEl.classList.add('show');
        }
    } catch (error) {
        errorEl.textContent = 'Erro de conexão';
        errorEl.classList.add('show');
    }
}

// History
async function showHistory() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/games/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const list = document.getElementById('history-list');
            list.innerHTML = '';

            if (data.history.length === 0) {
                list.innerHTML = '<p>Nenhuma partida ainda.</p>';
            } else {
                data.history.forEach(match => {
                    const item = document.createElement('div');
                    item.className = 'history-item';
                    const isWinner = match.winner_id === currentUser.id;
                    if (isWinner) item.classList.add('won');
                    else item.classList.add('lost');
                    
                    item.innerHTML = `
                        <strong>${match.game_type === 'memory' ? '🧠 Memória' : '⚡ Corrida'}</strong><br>
                        vs ${match.player1_id === currentUser.id ? match.player2_username : match.player1_username}<br>
                        ${isWinner ? '✅ Vitória' : '❌ Derrota'}<br>
                        Pontos: ${match.points_exchanged > 0 ? (isWinner ? '+' : '-') : ''}${match.points_exchanged}<br>
                        <small>${new Date(match.created_at).toLocaleString('pt-BR')}</small>
                    `;
                    list.appendChild(item);
                });
            }

            document.getElementById('history-modal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

