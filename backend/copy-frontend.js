// Script para copiar frontend para dentro do backend durante o build
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../frontend');
const targetDir = path.join(__dirname, 'public');

console.log('📦 Copiando frontend para backend/public...');
console.log('   Origem:', sourceDir);
console.log('   Destino:', targetDir);

// Criar diretório public se não existir
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('✅ Diretório public criado');
}

// Função para copiar recursivamente
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (fs.existsSync(sourceDir)) {
    copyRecursive(sourceDir, targetDir);
    console.log('✅ Frontend copiado com sucesso!');
  } else {
    console.log('⚠️  Diretório frontend não encontrado em:', sourceDir);
  }
} catch (error) {
  console.error('❌ Erro ao copiar frontend:', error.message);
  process.exit(1);
}

