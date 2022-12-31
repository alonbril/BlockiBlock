const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const BloomFilter = require('bloom-filter');
const  MerkleTree  = require("merkletreejs");

// ori alon
const numberOfElements = 3;
const falsePositiveRate = 0.01;

const burnFeeBase = 1;
let burnedTokens = 0;

class Transaction {
    constructor (fromAdress, toAdress, amount) {
        this.fromAdress = fromAdress;
        this.toAdress = toAdress;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    calculateHash() {
        return SHA256(this.fromAdress + this.toAdress + this.timestamp).toString();
    }
//ori alon
    signingTransaction(signingkey) {
        if (signingkey.getPublic('hex') !== this.fromAdress) {
            throw new Error("You can't sign transactions for other wallets!");
        }

        const hashTx = this.calculateHash();
        const sig = signingkey.sign(hashTx,'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAdress === null) return true;
        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature provided in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAdress,'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

}

let numOfBlock = 1;

class Block {
    constructor(timestamp, transaction, previousHash="") {
        this.timestamp = timestamp;
        this.transaction = transaction;
        this.previousHash = previousHash;
        this.hash = this.calculateHash()
        this.nonce = 0;
        this.initMerkleTree(transaction);
    }

     initMerkleTree() {
    const leaves = this.transactions.map((x) => SHA256(x.signature));
    this.merkleTree = new MerkleTree(leaves, SHA256);
    this.root = this.merkleTree.getRoot().toString('hex');
  }
  
  isFoundInMerkleTree(signature) {
    const leaf = SHA256(signature);
    const proof = this.merkleTree.getProof(leaf);
    return this.merkleTree.verify(proof, leaf, this.root);
  }
    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transaction) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0,difficulty) !== Array(difficulty+1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block Mined : ' + this.nonce);
        console.log(`Block Number : ${numOfBlock}`);
        numOfBlock++;
    }

    validTransaction() {
        for (let tx of this.transaction) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}

class BlockChain {
    constructor(){
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 30;
        
        this.filter = BloomFilter.create(numberOfElements, falsePositiveRate);
    }

    createGenesisBlock() {
        return new Block('11/11/2009','Genesis Block', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length-1];
    }

    mineCurrentBlock(winnersMinerAdress) {
        let rewardTx = new Transaction(null, winnersMinerAdress, this.miningReward + 1);
        this.pendingTransactions.push(rewardTx);
        const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        block.initMerkleTree(this.blockTransactions);
        console.log('Block  mined!');
        console.log('------------------------------------------');
        this.chain.push(block);
        this.pendingTransactions = [];
    }
//ori alon
    addTransaction(transaction) {
        if (!transaction.fromAdress || !transaction.toAdress) {
            throw Error('Transaction without an address');
        }
        
        if (!transaction.isValid()) {
            throw Error('Transaction  not valid!');
        }
        console.log('Valid Transaction');
        this.filter.insert(transaction);
        
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAdress(adress) {
        let balance = 100;
        let i = 0;
        for (let block of this.chain) {
            for (let trans of block.transaction) {
                if (trans.fromAdress === adress) {
                     balance -= trans.amount;
                     balance -= burnFeeBase;
                     if (i <= 5) {
                        balance -= i;
                        burnedTokens += i;
                     }
                     else {
                        balance -= 5;
                        burnedTokens += 5;
                     }
                }
                if (trans.toAdress === adress) balance += trans.amount;
            }
            i++;
        }

        return balance;
    }

    isValidate() {
        for (let i = 1; i < this.chain.length; i++)
        {
            const currentBlock = this.chain[i];
            const prevBlock = this.chain[i-1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.log('Invalid Transaction');
                return false;
            }
            if (currentBlock.previousHash !== prevBlock.hash) {
                console.log('Invalid Transaction');
                return false;
            }
            if (!canTrans()) {
                console.log('Invalid Transaction');
                return false;
        }
        }
        console.log('Valid Transaction');
        return true;
    }

    chainLength() {
        return this.chain.length;
    }

    canTrans() {
        if (numOfBlock <= 5) {
            blockFee = numOfBlock;
        }
        else {
            blockFee = 5;
        }
        if (getBalanceOfAdress(this.fromAdress) < (amount + burnFeeBase + blockFee)) {
            console.log('Not enough money for transaction');
            return false;
        }
        console.log('Transaction approved');
        return true;
    }

    getBurned() {
        return burnedTokens;
    }

    bloomFilterValidation (transaction) {
        return this.filter.contains(transaction);
    }
//ori alon
    merkleTreeValidation(transaction) {
    let i = 0;
    let found = false;
    this.chain.forEach((block) => {
        if (block.isFoundInMerkleTree(transaction)) {
          console.log('The transaction is located in block number : '+ i + '.');
          found = true;
        }
      i++;
    });
    if (!found)
      console.log("The transaction wasn't found");
  }
}

module.exports.BlockChain = BlockChain;
module.exports.Block = Block;
module.exports.Transaction  = Transaction;