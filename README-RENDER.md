# 🚀 Deploy no Render

## Configuração no Render

### 1. Criar um novo Web Service

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub

### 2. Configurações do Serviço

- **Name**: `jogo-backend` (ou o nome que preferir)
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Plan**: Free (ou o plano que preferir)

### 3. Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no painel do Render:

```
DATABASE_URL=postgresql://neondb_owner:npg_izJKD7Qm0kEh@ep-wandering-resonance-a9e1300q-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456789
NODE_ENV=production
PORT=10000
```

**Importante**: 
- Altere o `JWT_SECRET` para uma string aleatória e segura
- O `PORT` será definido automaticamente pelo Render, mas você pode deixar essa variável

### 4. Deploy

1. Clique em "Create Web Service"
2. O Render irá fazer o build e deploy automaticamente
3. Aguarde o deploy completar
4. Acesse a URL fornecida pelo Render (ex: `https://jogo-backend.onrender.com`)

## Estrutura de Pastas

Certifique-se de que a estrutura está assim:

```
.
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   └── db/
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── images/
├── render.yaml
└── README.md
```

## Troubleshooting

### Erro "Cannot GET"
- Verifique se o caminho dos arquivos estáticos está correto
- Verifique os logs do Render para ver se há erros

### Erro de conexão com banco de dados
- Verifique se a variável `DATABASE_URL` está configurada corretamente
- Verifique se o banco PostgreSQL Neon está acessível

### Socket.io não conecta
- Verifique se a URL do frontend está usando `window.location.origin`
- Verifique se o CORS está configurado corretamente

## Testando

Após o deploy, acesse a URL do Render. Você deve ver:
- Tela de login/registro
- Sistema de pontos funcionando
- Jogos multiplayer funcionando

