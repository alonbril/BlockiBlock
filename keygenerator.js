const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key1 = ec.genKeyPair();
const publicKey1 = key1.getPublic('hex');
const privateKey1 = key1.getPrivate('hex');

const key2 = ec.genKeyPair();
const publicKey2 = key2.getPublic('hex');
const privateKey2 = key2.getPrivate('hex');

console.log('Public Key: ' + publicKey1 + '\n');
console.log('Private Key - DO NOT SHARE!!: ' + privateKey1);

console.log('Public Key: ' + publicKey2 + '\n');
console.log('Private Key - DO NOT SHARE!!: ' + privateKey2);