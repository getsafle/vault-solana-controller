const bip39 = require('bip39');
const solanaWeb3 = require('@solana/web3.js');
const { derivePath } = require('ed25519-hd-key');
const nacl = require('tweetnacl');
const bs58 = require('bs58');

const { solana: { HD_PATH } } = require('./config')

class SOLHdKeyring {
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
    return { privateKey: accountDetails.secretKey.toString('hex') };
  }

  async signTransaction(transaction) {
    const txn = new solanaWeb3.Transaction().add(transaction)
    const signer = {
      publicKey: this.wallet.publicKey,
      secretKey: this.wallet.secretKey
    }
    txn.sign(signer)
    return { signedTransaction: txn };
  }

  async signMessage(message) {
    return { signedMessage: bs58.encode(nacl.sign.detached(bs58.decode(message), this.wallet.secretKey)) };
  }

  async getAccounts() {
    const accountDetails = this.wallet;
    return { address: accountDetails.publicKey.toString() }
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
