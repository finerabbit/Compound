const Web3 = require('web3');
require('dotenv').config();
const web3 = new Web3('https://ropsten.infura.io/v3/' + process.env.API_KEY);

const privateKey = process.env.PRIVATE_KEY;

web3.eth.accounts.wallet.add('0x' + privateKey);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

console.log(privateKey);
console.log(myWalletAddress);

const contractAddress = '0xbe839b6d93e3ea47effcca1f27841c917a8794f3'; // for Ropsten test net.
const abiJson = require('./abis/compoundCEthABI.json');
const compoundCEthContract = new web3.eth.Contract(abiJson, contractAddress);

const ethDecimals = 18;

const main = async function() {
    let ethBalance = await web3.eth.getBalance(myWalletAddress) / Math.pow(10, ethDecimals);
    console.log("My wallet's ETH balance:", ethBalance, '\n');
    console.log('Supplying ETH to the Compound Protocol...', '\n');
    
    // Mint some cETH by supplying ETH to the Compound Protocol
    await compoundCEthContract.methods.mint().send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(150000),
        gasPrice: web3.utils.toHex(20000000000),
        value: web3.utils.toHex(web3.utils.toWei('1', 'ether'))
    });

    console.log('cETH "Mint" operation successful.', '\n');

    const balanceOfUnderlying = web3.utils.toBN(await compoundCEthContract.methods
        .balanceOfUnderlying(myWalletAddress).call()) / Math.pow(10, ethDecimals);
    
    console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying);

    let cTokenBalance = await compoundCEthContract.methods.balanceOf(myWalletAddress).call() / 1e8;

    console.log("My wallet's cETH Token Balance:", cTokenBalance, '\n');

    let exchangeRateCurrent = await compoundCEthContract.methods.exchangeRateCurrent().call();
    exchangeRateCurrent = exchangeRateCurrent / Math.pow(10, 18 + ethDecimals - 8);
    console.log("Current exchange rate from cETH to ETH:", exchangeRateCurrent, '\n');

    console.log('Redeeming the cETH for ETH...', '\n');

    console.log('Exchanging all cETH based on cToken amount...', '\n');

    let redeemBalance = 1 / exchangeRateCurrent;    // for redeeming 1 ETH.
    console.log("Current exchange rate from ETH to cETH", redeemBalance);
    await compoundCEthContract.methods.redeem(parseInt(redeemBalance * 1e8, 10)).send({
        from: myWalletAddress,
        gasLimit: web3.utils.toHex(500000),
        gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
    });
    
    cTokenBalance = await compoundCEthContract.methods.balanceOf(myWalletAddress).call() / 1e8;
    console.log("My wallet's cETH Token Balance:", cTokenBalance);

    ethBalance = await web3.eth.getBalance(myWalletAddress) / Math.pow(10, ethDecimals);
    console.log("My wallet's ETH balance:", ethBalance, '\n');
}

main().catch((err) => {
    console.error(err);
});

//.......