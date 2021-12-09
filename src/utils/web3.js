//web3.js
import store from '../store'
const contractAddress = ''
const contractABI=[]
var contract=null;
function Init(callback){
  // if (!Web3.givenProvider) {
  //   console.log( '请确保您的浏览器已经安装了MetaMask插件' );
  //   return;
  // }
  // let web3ceshi = new Web3( Web3.givenProvider );
  // console.log( 'this.web3', web3ceshi );
  if (typeof window.ethereum === "undefined") {
    // alert("Looks like you need a Dapp browser to get started.");
    alert("Consider installing MetaMask!");
  } else {
    const ethereum = window.ethereum;
    ethereum
    .request({ method: 'eth_requestAccounts' })
    .then((accounts) => {
      var currentProvider = web3.currentProvider;
      // var Web3 = web3js.getWeb3();
      web3 = new Web3(currentProvider);
      web3.setProvider(currentProvider);
      // contract = new web3.eth.Contract(contractABI, contractAddress);
      if(!accounts){
        return false
      }
      store.dispatch('setMetaAddress', accounts[0])
      callback(accounts[0])
    })
    .catch((error) => {
      if (error === "User rejected provider access") {
      } else {
        alert("There was an issue signing you in.");
        return false
      }
      console.error(
        `Error fetching accounts: ${error.message}.
        Code: ${error.code}. Data: ${error.data}`
      );
    });
  }
}

export default {
  Init
}