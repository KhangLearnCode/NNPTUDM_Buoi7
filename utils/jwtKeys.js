const fs = require('fs');
const path = require('path');
const { generateKeyPairSync } = require('crypto');

const keysDir = path.join(__dirname, '..', 'keys');
const privateKeyPath = path.join(keysDir, 'private.pem');
const publicKeyPath = path.join(keysDir, 'public.pem');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateKeys() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  fs.writeFileSync(privateKeyPath, privateKey, { encoding: 'utf8', mode: 0o600 });
  fs.writeFileSync(publicKeyPath, publicKey, { encoding: 'utf8', mode: 0o644 });
}

function loadKey(filePath) {
  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

function loadKeys() {
  ensureDir(keysDir);
  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    generateKeys();
  }
  return {
    privateKey: loadKey(privateKeyPath),
    publicKey: loadKey(publicKeyPath)
  };
}

module.exports = loadKeys();
