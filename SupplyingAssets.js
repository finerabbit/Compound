const Web3 = require('web3');
const web3 = new Web3('https://ropsten.infura.io/v3/' + process.env.API_KEY);
require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY;

web3.eth.accounts.wallet.add('0x' + privateKey);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

console.log(privateKey);
console.log(myWalletAddress);