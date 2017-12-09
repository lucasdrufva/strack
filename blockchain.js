var http = require('http');
var fs = require('fs');
const SHA256 = require("crypto-js/sha256");
var request = require('request');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
      return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
        this.nonce++;
        this.hash = this.calculateHash();
    }

    console.log("BLOCK MINED: " + this.hash);
  }
}

class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
    }

    createGenesisBlock() {
        return new Block(0, "01/01/2017", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    addRawBlock(newBlock) {
      this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    sync() {
      //var ip = [];
      let strack = new Blockchain();
      var text = fs.readFileSync('nodelist.txt','utf8');
      var ip = text.split(",");
      var latestblock =  this.chain[this.chain.length - 1];
      var blockIndex = latestblock.index;
      console.log('bl: ', blockIndex);
      var sync = false;
      var rblockchain = '';
      for(var i = 0; i < ip.length - 1; i++){
        //console.log(ip[i]);
        var address = 'http://' + ip[i] + ':8080/api/getLatestBlock'
        var ipo = ip[i]
        request(address, function (error, response, body) {
          let stracka = new Blockchain();
          stracka.loadFromFile();
          console.log(blockIndex);
          console.log('biudy:', body);
          rblockchain = JSON.parse(body);
          console.log(rblockchain.index);
          if (Number(rblockchain.index) !== blockIndex) {
            console.log("sync");
            sync = true;

          }else{sync = false;}
          if (sync) {
            if(Number(rblockchain.index) < blockIndex){
              if((blockIndex - Number(rblockchain.index)) > 1){
                var addressss = 'http://'+ ipo + ':8080/api/sync/'
                request(addressss, function (error, response, body) {
                  console.log('error:', error); // Print the error if one occurred
                  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                  console.log('body:', body); // Print the HTML for the Google homepage.
                });
              }else {
                for (var j = Number(rblockchain.index); j < blockIndex; j++) {
                  let strackb = new Blockchain();
                  strackb.loadFromFile();
                  var addresss = 'http://'+ ipo + ':8080/api/addBlock'
                  console.log(ipo);
                  console.log(strackb.chain[j + 1]);
                  request.post({
                    headers: {'content-type' : 'application/x-www-form-urlencoded'},
                    url:     addresss,
                    body:    "block=" + JSON.stringify(strackb.chain[j + 1])
                  }, function(error, response, body){
                    console.log(body);
                  });
                }
              }
            }
          }
        });


      }

    }

    loadFromFile(){
      var text = fs.readFileSync('blockchaintest.txt','utf8');
      var blockchain = JSON.parse(text);
      for(let i = 1; i < blockchain.length; i++){
        this.chain[i] = blockchain[i];
      }
    }

    syncip(ip){
      var latestblock =  this.chain[this.chain.length - 1];
      var blockIndex = latestblock.index;
      var adress = 'http://' + ip + ':8080/api/getBlock/' + blockIndex.toString();
      var res = '';
      request(address, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
      });
    }

    saveToFile(){
      fs.writeFile('blockchaintest.txt', JSON.stringify(this.chain), function (err) {
        if (err) return console.log(err);
      });
    }
}

const blockchain = new Blockchain();
module.exports = blockchain;