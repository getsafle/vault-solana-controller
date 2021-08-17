const bip39 = require('bip39');
const solanaWeb3 = require('@solana/web3.js');
const { derivePath } = require('ed25519-hd-key');
const nacl = require('tweetnacl');

const { solana: { HD_PATH } } = require('../config')

class SOLHdKeyring {
  // constructor (mnemonic, hdPath) {
  constructor(mnemonic) {
    this.mnemonic = mnemonic
    this.hdPath = HD_PATH
    this.wallet = null
    this.address = null
  }

  async generateWallet() {
    const accountDetails = this._manageSeedandGetAccountDetails()
    this.wallet = accountDetails
    this.address = accountDetails.publicKey.toString()
    return { address: this.address }
  }

  async exportPrivateKey() {
    const accountDetails = this.wallet
    return accountDetails.secretKey.toString('hex')
  }

  async signTransaction(transaction) {
    const txn = new solanaWeb3.Transaction().add(transaction)
    const signer = {
      publicKey: this.wallet.publicKey,
      secretKey: this.wallet.secretKey
    }
    return txn.sign([signer])
  }

  async signMessage() {
  }

  async getAccounts() {

  }

  /* PRIVATE METHODS */

  _getAccountDetailsFromSeed(seed, dPath) {
    const derivedSeed = derivePath(dPath, seed).key;
    const account = new solanaWeb3.Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
    return account;
  }

  _manageSeedandGetAccountDetails() {
    const normalizeMnemonic = this.mnemonic.trim().split(/\s+/g).join(" ")
    const seedHex = bip39.mnemonicToSeedHex(normalizeMnemonic)
    return this._getAccountDetailsFromSeed(
      Buffer.from(seedHex, 'hex'),
      this.hdPath,
    );
  }

}

module.exports = SOLHdKeyring
