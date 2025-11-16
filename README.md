# 🎮 Site de Jogos Online

Site de jogos multiplayer com dois modos: **Jogo da Memória** e **Corrida de Cliques**.

## 🚀 Funcionalidades

- ✅ Sistema de registro e login com senha
- ✅ Sistema de pontos (início com 3 pontos)
- ✅ Dois jogos multiplayer em tempo real:
  - 🧠 Jogo da Memória
  - ⚡ Corrida de Cliques
- ✅ Sistema de salas/matchmaking
- ✅ Histórico de partidas
- ✅ Sistema de saque (mínimo 50 pontos)
- ✅ Equilíbrio de dificuldade baseado em pontos
- ✅ Interface moderna e responsiva

## 📁 Estrutura do Projeto

```
.
├── backend/
│   ├── db/
│   │   ├── database.js
│   │   └── init.sql
│   ├── routes/
│   │   ├── auth.js
│   │   └── games.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── images/
└── README.md
```

## 🛠️ Instalação

### Backend

```bash
cd backend
npm install
```

Configure o arquivo `.env` com suas credenciais do banco de dados.

### Frontend

O frontend é estático e pode ser servido pelo Express ou qualquer servidor web.

## 🚀 Execução

### Backend

```bash
cd backend
npm start
```

O servidor rodará na porta 3000 (ou a porta definida no `.env`).

### Frontend

O frontend é servido automaticamente pelo Express na raiz do servidor.

Acesse: `http://localhost:3000`

## 🎯 Como Jogar

1. **Registre-se** ou faça **login**
2. Escolha um jogo (Memória ou Corrida de Cliques)
3. Aguarde encontrar um oponente
4. Jogue e ganhe pontos!
5. Ganhar uma partida te dá os pontos do adversário
6. Entre em uma sala para ganhar 1 ponto extra

## 💰 Sistema de Pontos

- **Início**: 3 pontos
- **Entrar em sala**: +1 ponto
- **Ganhar partida**: Recebe os pontos do adversário
- **Perder partida**: Perde seus pontos para o adversário
- **Saque**: Mínimo de 50 pontos

## ⚖️ Equilíbrio de Dificuldade

Jogadores com mais pontos enfrentam desafios maiores:
- < 10 pontos: Dificuldade normal (1.0x)
- 10-50 pontos: 1.2x
- 50-100 pontos: 1.5x
- 100-200 pontos: 1.8x
- > 200 pontos: 2.0x

## 🗄️ Banco de Dados

O projeto usa PostgreSQL Neon. As tabelas são criadas automaticamente na primeira execução.

## 📝 Tecnologias

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: HTML, CSS, JavaScript
- **Banco de Dados**: PostgreSQL (Neon)
- **Autenticação**: JWT
- **Tempo Real**: WebSocket (Socket.io)

## 📄 Licença

Este projeto é de código aberto.

