#!/usr/bin/env node

/**
 * Script para copiar las fuentes de Bootstrap Icons desde node_modules
 * Se ejecuta automáticamente después de instalar/actualizar dependencias
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'node_modules', 'bootstrap-icons', 'font', 'fonts');
const targetDir = path.join(__dirname, 'public', 'fonts');

// Crear directorio de destino si no existe
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copiar archivos de fuentes
const fontFiles = ['bootstrap-icons.woff', 'bootstrap-icons.woff2'];

fontFiles.forEach(file => {
  const source = path.join(sourceDir, file);
  const target = path.join(targetDir, file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
    console.log(`✅ Copiado: ${file}`);
  } else {
    console.warn(`⚠️  No encontrado: ${file}`);
  }
});

console.log('🎉 Bootstrap Icons fuentes actualizadas correctamente');
