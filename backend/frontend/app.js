// GIFs do Pixabay - URLs diretas de GIFs gratuitos
// Para adicionar seus próprios GIFs do Pixabay:
// 1. Acesse https://pixabay.com/pt/gifs/
// 2. Escolha um GIF
// 3. Clique com botão direito > "Copiar endereço da imagem"
// 4. Cole a URL aqui
const gifUrls = [
    'https://cdn.pixabay.com/animation/2022/10/11/10/10-10-10-751_512.gif', // Gato
    'https://cdn.pixabay.com/animation/2022/10/11/10/10-10-10-752_512.gif', // Cachorro
    'https://cdn.pixabay.com/animation/2022/10/11/10/10-10-10-753_512.gif', // Coelho
    'https://cdn.pixabay.com/animation/2022/10/11/10/10-10-10-754_512.gif', // Pássaro
    'https://cdn.pixabay.com/animation/2022/10/11/10/10-10-10-755_512.gif', // Peixe
    'https://cdn.pixabay.com/animation/2022/10/11/10/10-10-10-756_512.gif', // Borboleta
    'https://cdn.pixabay.com/animation/2022/10/11/10/10-10-10-757_512.gif', // Estrela
    'https://cdn.pixabay.com/animation/2022/10/11/10/10-10-10-758_512.gif', // Coração
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
    
    // Criar pares de cartas
    cards = [];
    for (let i = 0; i < 8; i++) {
        // Usar GIFs do Pixabay ou alternativos
        const gifUrl = gifUrls[i] || alternativeGifs[i];
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

