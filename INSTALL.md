# 📦 Guia de Instalação

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Conta no PostgreSQL Neon (já configurada)

## Instalação

### 1. Instalar dependências do backend

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend/` com o seguinte conteúdo:

```
DATABASE_URL=postgresql://neondb_owner:npg_izJKD7Qm0kEh@ep-wandering-resonance-a9e1300q-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456789
PORT=3000
```

**Importante**: Altere o `JWT_SECRET` para uma string aleatória e segura!

### 3. Inicializar banco de dados

O banco de dados será inicializado automaticamente na primeira execução do servidor. As tabelas serão criadas automaticamente.

### 4. Iniciar o servidor

```bash
cd backend
npm start
```

Para desenvolvimento com auto-reload:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### 5. Acessar o site

Abra seu navegador e acesse:
```
http://localhost:3000
```

## Estrutura de Arquivos

```
.
├── backend/
│   ├── db/
│   │   ├── database.js       # Configuração do banco
│   │   └── init.sql          # Schema SQL
│   ├── routes/
│   │   ├── auth.js           # Rotas de autenticação
│   │   └── games.js          # Rotas de jogos
│   ├── server.js             # Servidor principal
│   ├── package.json
│   └── .env                  # Variáveis de ambiente
├── frontend/
│   ├── index.html            # Página principal
│   ├── styles.css            # Estilos
│   ├── app.js                # Lógica do frontend
│   └── images/               # Imagens dos jogos
└── README.md
```

## Solução de Problemas

### Erro de conexão com o banco

- Verifique se a string de conexão no `.env` está correta
- Certifique-se de que o banco Neon está ativo

### Porta já em uso

- Altere a porta no arquivo `.env`
- Ou pare o processo que está usando a porta 3000

### Erro de módulos não encontrados

- Execute `npm install` novamente na pasta `backend/`
- Verifique se o Node.js está atualizado

## Desenvolvimento

Para desenvolvimento, use:

```bash
npm run dev
```

Isso iniciará o servidor com nodemon, que recarrega automaticamente quando você faz alterações.

