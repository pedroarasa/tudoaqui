# 🧠 Jogo da Memória com GIFs do Pixabay

Um jogo da memória interativo usando GIFs animados do Pixabay.

## 🎮 Como Jogar

1. Clique em duas cartas para virá-las
2. Encontre os pares de GIFs iguais
3. Complete o jogo encontrando todos os 8 pares
4. Tente fazer o menor número de movimentos possível!

## 🚀 Como Executar

### Opção 1: Abrir diretamente
1. Baixe os arquivos (`index.html`, `styles.css`, `app.js`)
2. Abra o `index.html` no seu navegador

### Opção 2: Servidor local
```bash
# Com Python
python -m http.server 8000

# Com Node.js
npx http-server

# Com PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

## 📁 Estrutura

```
.
├── index.html      # Estrutura HTML do jogo
├── styles.css      # Estilos e animações
├── app.js          # Lógica do jogo
└── README.md       # Este arquivo
```

## 🎨 Recursos

- ✅ GIFs animados do Pixabay
- ✅ Animações suaves de flip
- ✅ Contador de movimentos
- ✅ Design responsivo
- ✅ Mensagem de vitória
- ✅ Fallback para GIFs que não carregam

## 🔧 Personalização

Para usar seus próprios GIFs, edite o array `gifUrls` no arquivo `app.js`:

```javascript
const gifUrls = [
    'URL_DO_SEU_GIF_1',
    'URL_DO_SEU_GIF_2',
    // ... adicione mais GIFs
];
```

## 📝 Notas

- Os GIFs são carregados diretamente do Pixabay
- Se um GIF não carregar, um emoji será exibido como fallback
- O jogo funciona offline após os GIFs serem carregados

## 🎯 Funcionalidades

- Grid 4x4 (16 cartas, 8 pares)
- Sistema de pontuação
- Animação de flip 3D
- Feedback visual para pares encontrados
- Botão de reset para novo jogo

