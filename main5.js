const {BlockChain, Block, Transaction} = require('./blockchain5.js');
const {Wallet} = require('./wallet.js');
const bloomFilter = require('bloom-filter');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const minerPriority = 1;

const private1 = ec.keyFromPrivate('caa7869d5cb856f30052ac349c0d669636e4c8b5783dfe65bfad0c9c85809e3d');
const public1 = private1.getPublic('hex');
const wallet1 = new Wallet(private1,public1);

const private2 = ec.keyFromPrivate('10984ece54950017b5b8a72b12fe1ca61d95b6c171dbe3cdb6c4c88023f3a338');
const public2 = private2.getPublic('hex');
const wallet2 = new Wallet(private2,public2);

const firstChain = new BlockChain();


for (let i = 1; i <= 30; i++) {
  const tx = new Transaction(wallet1.pbKey, wallet2.pbKey, i * 100);
  tx.signingTransaction(wallet1.prkey);
  firstChain.addTransaction(tx);
  if (i % 4 === 0) {
     firstChain.mineCurrentBlock(wallet1.pbKey);
  }
}

for (let i = 1; i <= 30; i++) {
  const tx = new Transaction(wallet2.pbKey, wallet1.pbKey, i * 100);
  tx.signingTransaction(wallet2.pbKey)


}
const wallet1Amount = firstChain.getBalanceOfAdress(wallet1.pbKey);
const wallet2Amount = firstChain.getBalanceOfAdress(wallet2.pbKey);
console.log(`The balance of wallet1 is: ${wallet1Amount}`);
console.log(`The balance of wallet2 is: ${wallet2Amount}`);
console.log(`The amount of coins that were mined is: ${(firstChain.chainLength()-1)*20}`);
console.log(`The amount of coins that are in the network is: ${wallet1Amount + wallet2Amount}`);
console.log(`The amount of coins that were burned is: ${(firstChain.getBurned())}`);
console.log('Bloom Filter:');
console.log(firstChain.bloomFilterValidation(tx1));
console.log(firstChain.bloomFilterValidation('abcde'));


console.log('Merkle Tree:');
console.log(firstChain.merkleTreeValidation(tx1));
console.log(firstChain.merkleTreeValidation('abcde'));