# 🧠 Jogo da Memória com GIFs do Pixabay

Jogo da memória interativo usando GIFs animados do Pixabay, com backend Node.js/Express para deploy no Render.

## 📁 Estrutura do Projeto

```
.
├── frontend/           # Arquivos do frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/            # Backend Node.js/Express
│   ├── server.js       # Servidor que serve o frontend
│   └── package.json
├── package.json        # Configuração raiz
├── render.yaml         # Configuração do Render
└── README.md
```

## 🚀 Deploy no Render

### Configuração Automática

O projeto está configurado para deploy automático no Render:

1. **Build Command**: `npm install`
2. **Start Command**: `npm start`
3. **Frontend**: Servido automaticamente de `frontend/`

### Como Funciona

- O `backend/server.js` serve os arquivos estáticos da pasta `frontend/`
- O Render executa `npm start` que inicia o servidor
- O frontend é servido automaticamente na raiz do site

## 🎮 Como Jogar

1. Clique em duas cartas para virá-las
2. Encontre os pares de GIFs iguais
3. Complete o jogo encontrando todos os 8 pares
4. Tente fazer o menor número de movimentos possível!

## 🎨 Adicionar Seus Próprios GIFs

Veja o arquivo `COMO-ADICIONAR-GIFS.md` para instruções detalhadas.

Resumo:
1. Acesse https://pixabay.com/pt/gifs/
2. Escolha um GIF
3. Copie a URL da imagem
4. Cole no array `gifUrls` em `frontend/app.js`

## 🛠️ Desenvolvimento Local

### Instalar dependências
```bash
npm install
```

### Executar
```bash
npm start
```

O servidor estará em: `http://localhost:3000`

## 📝 Funcionalidades

- ✅ 16 cartas (8 pares) com GIFs animados
- ✅ Animações de flip 3D
- ✅ Contador de movimentos
- ✅ Contador de pares encontrados
- ✅ Mensagem de vitória
- ✅ Fallback automático se GIF não carregar
- ✅ Design responsivo
- ✅ Pronto para deploy no Render

## 🔧 Tecnologias

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **Deploy**: Render.com
- **GIFs**: Pixabay (gratuitos)

## 📄 Licença

Este projeto usa GIFs do Pixabay que são gratuitos para uso comercial.
