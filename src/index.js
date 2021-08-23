const bip39 = require('bip39');
const solanaWeb3 = require('@solana/web3.js');
const nacl = require('tweetnacl');
const bs58 = require('bs58');

const { solana: { HD_PATH } } = require('./config')
const { _manageSeedandGetAccountDetails } = require('./helper/index')

class SOLHdKeyring {
  constructor(mnemonic) {
    this.mnemonic = mnemonic
    this.hdPath = HD_PATH
    this.wallet = null
    this.address = null
  }

  async generateWallet() {
    const accountDetails = _manageSeedandGetAccountDetails(this.mnemonic, this.hdPath)
    this.address = accountDetails.publicKey.toString()
    return { address: this.address }
  }

  async exportPrivateKey() {
    const accountDetails = _manageSeedandGetAccountDetails(this.mnemonic, this.hdPath)
    return { privateKey: accountDetails.secretKey.toString('hex') };
  }

  async signTransaction(transaction) {
    const txn = new solanaWeb3.Transaction().add(transaction)
    const signer = _manageSeedandGetAccountDetails(this.mnemonic, this.hdPath)
    txn.sign(signer)
    return { signedTransaction: txn };
  }

  async signMessage(message) {
    return { signedMessage: bs58.encode(nacl.sign.detached(bs58.decode(message), this.wallet.secretKey)) };
  }

  async getAccounts() {
    return { address: this.address }
  }

}

module.exports = SOLHdKeyring
