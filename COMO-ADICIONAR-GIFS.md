# 🎨 Como Adicionar GIFs do Pixabay

## Passo a Passo

### 1. Acesse o Pixabay
Vá para: https://pixabay.com/pt/gifs/

### 2. Escolha um GIF
- Navegue pelos GIFs disponíveis
- Clique no GIF que você gostou

### 3. Copie a URL da Imagem
- Clique com o botão direito no GIF
- Selecione "Copiar endereço da imagem" ou "Copy image address"
- A URL será algo como: `https://cdn.pixabay.com/animation/2023/.../arquivo.gif`

### 4. Adicione no Código
Abra o arquivo `app.js` e encontre o array `gifUrls`:

```javascript
const gifUrls = [
    'URL_DO_GIF_1_AQUI',
    'URL_DO_GIF_2_AQUI',
    'URL_DO_GIF_3_AQUI',
    // ... adicione mais GIFs
];
```

### 5. Cole a URL
Cole a URL que você copiou no array, substituindo uma das URLs existentes ou adicionando uma nova.

## Exemplo

```javascript
const gifUrls = [
    'https://cdn.pixabay.com/animation/2023/10/28/14/14-14-14-835_512.gif', // Seu GIF 1
    'https://cdn.pixabay.com/animation/2023/10/28/14/14-14-14-836_512.gif', // Seu GIF 2
    // ... continue adicionando
];
```

## Dicas

- ✅ Use GIFs pequenos (até 512x512px) para carregamento mais rápido
- ✅ Certifique-se de que o GIF é gratuito e pode ser usado
- ✅ Teste o jogo após adicionar novos GIFs
- ✅ Se um GIF não carregar, o jogo usará um fallback automaticamente

## Quantos GIFs Preciso?

O jogo precisa de **8 GIFs diferentes** para criar 8 pares (16 cartas no total).

Se você adicionar mais de 8 GIFs, o jogo usará apenas os primeiros 8.

## Problemas?

Se um GIF não carregar:
1. Verifique se a URL está correta
2. Teste a URL diretamente no navegador
3. O jogo tentará usar um GIF alternativo automaticamente
4. Se nada funcionar, um emoji será exibido como fallback

