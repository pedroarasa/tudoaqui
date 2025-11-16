// GIFs do Pixabay - URLs diretas de GIFs gratuitos
// URLs fornecidas pelo usuário do Pixabay
const gifUrls = [
    'https://cdn.pixabay.com/animation/2025/06/02/00/11/00-11-22-330_512.gif',
    'https://cdn.pixabay.com/animation/2025/04/29/23/55/23-55-02-125_512.gif',
    'https://cdn.pixabay.com/animation/2024/07/30/00/20/00-20-15-644_512.gif',
    'https://cdn.pixabay.com/animation/2025/05/11/01/07/01-07-40-349_512.gif',
    'https://cdn.pixabay.com/animation/2023/05/04/16/12/16-12-04-538_512.gif',
    'https://cdn.pixabay.com/animation/2022/10/25/12/11/12-11-02-585_512.gif',
    'https://cdn.pixabay.com/animation/2024/01/19/00/53/00-53-56-818_512.gif',
    'https://cdn.pixabay.com/animation/2024/11/04/11/13/11-13-55-982_512.gif',
    'https://cdn.pixabay.com/animation/2024/10/29/00/47/00-47-41-487_512.gif',
    'https://cdn.pixabay.com/animation/2025/04/15/01/46/01-46-47-585_512.gif',
    'https://cdn.pixabay.com/animation/2024/11/24/21/05/21-05-33-467_512.gif',
    'https://cdn.pixabay.com/animation/2025/01/13/17/58/17-58-14-229_512.gif',
    'https://cdn.pixabay.com/animation/2023/05/17/16/04/16-04-26-783_512.gif',
    'https://cdn.pixabay.com/animation/2024/12/18/01/23/01-23-42-647_512.gif',
];

// GIFs alternativos do Giphy (fallback caso os do Pixabay não carreguem)
const alternativeGifs = [
    'https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif',
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif',
    'https://media.giphy.com/media/3o7aD2saal8vX8Kd7y/giphy.gif',
    'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
    'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif',
    'https://media.giphy.com/media/l0HlPystf7vSlgk5O/giphy.gif',
];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let lockBoard = false;

// Inicializar o jogo
function initGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    // Usar apenas os primeiros 8 GIFs para criar 8 pares (16 cartas)
    const gifsToUse = gifUrls.slice(0, 8);
    
    // Criar pares de cartas
    cards = [];
    for (let i = 0; i < gifsToUse.length; i++) {
        // Usar GIFs do Pixabay ou alternativos como fallback
        const gifUrl = gifsToUse[i] || alternativeGifs[i];
        cards.push({ id: i * 2, gifUrl, pairId: i });
        cards.push({ id: i * 2 + 1, gifUrl, pairId: i });
    }
    
    // Embaralhar cartas
    shuffleCards();
    
    // Criar elementos HTML das cartas
    cards.forEach(card => {
        const cardElement = createCardElement(card);
        gameBoard.appendChild(cardElement);
    });
    
    // Resetar variáveis
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    lockBoard = false;
    updateScore();
    document.getElementById('win-message').classList.add('hidden');
}

// Embaralhar cartas
function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

// Criar elemento HTML da carta
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'memory-card';
    cardDiv.dataset.cardId = card.id;
    cardDiv.dataset.pairId = card.pairId;
    
    // Frente da carta (com ?)
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.textContent = '?';
    
    // Verso da carta (com GIF)
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    const img = document.createElement('img');
    img.src = card.gifUrl;
    img.alt = `GIF ${card.pairId}`;
    img.onerror = function() {
        // Se o GIF do Pixabay não carregar, tentar o alternativo
        const altUrl = alternativeGifs[card.pairId];
        if (altUrl && this.src !== altUrl) {
            this.src = altUrl;
        } else {
            // Se nenhum GIF carregar, usar emoji como fallback
            this.style.display = 'none';
            cardBack.textContent = '🎴';
            cardBack.style.fontSize = '4em';
        }
    };
    img.loading = 'lazy'; // Carregamento otimizado
    cardBack.appendChild(img);
    
    cardDiv.appendChild(cardFront);
    cardDiv.appendChild(cardBack);
    
    cardDiv.addEventListener('click', () => flipCard(cardDiv));
    
    return cardDiv;
}

// Virar carta
function flipCard(cardElement) {
    if (lockBoard) return;
    if (cardElement.classList.contains('flipped')) return;
    if (cardElement.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;
    
    cardElement.classList.add('flipped');
    flippedCards.push(cardElement);
    
    if (flippedCards.length === 2) {
        lockBoard = true;
        moves++;
        updateScore();
        checkMatch();
    }
}

// Verificar se as cartas são um par
function checkMatch() {
    const [firstCard, secondCard] = flippedCards;
    const firstPairId = firstCard.dataset.pairId;
    const secondPairId = secondCard.dataset.pairId;
    
    if (firstPairId === secondPairId) {
        // Par encontrado!
        setTimeout(() => {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            flippedCards = [];
            matchedPairs++;
            lockBoard = false;
            
            if (matchedPairs === 8) {
                setTimeout(() => {
                    showWinMessage();
                }, 500);
            }
        }, 1000);
    } else {
        // Não é um par, virar de volta
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            flippedCards = [];
            lockBoard = false;
        }, 1500);
    }
}

// Atualizar pontuação
function updateScore() {
    document.getElementById('moves').textContent = moves;
    document.getElementById('pairs').textContent = matchedPairs;
}

// Mostrar mensagem de vitória
function showWinMessage() {
    document.getElementById('final-moves').textContent = moves;
    document.getElementById('win-message').classList.remove('hidden');
}

// Resetar jogo
function resetGame() {
    initGame();
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

