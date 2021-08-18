const { getSolanaInstance } = require('./utils/helper')

class CoinHDWallets {

  constructor(mnemonic) {
    this.mnemonic = mnemonic
    this.instance = getSolanaInstance(this.mnemonic)
  }

  async createSolanaInstance () {
    const instance = 
    this.instance = instance
  }

  async generateWallet() {
    const wallet = await this.instance.generateWallet()
    console.log("wallet " , wallet)
    return wallet
  }

  async exportPrivateKey() {
    const privateKey = await this.instance.exportPrivateKey()
    console.log(" privateKey ", privateKey)
    return privateKey
  }

  async signTransaction(transaction) {
    const txn = await this.instance.signTransaction(transaction)
    console.log(" txn ", txn)
    return txn
  }

  async signMessage(message) {
    const msgSig = await this.instance.signMessage(message)
    console.log(" msgSig ", msgSig)
    return msgSig
  }

  async getAccounts() {
    const account = await this.instance.getAccounts()
    console.log(" account ", account)
    return account
  }

}

const wallet = new CoinHDWallets('affair entry detect broom axis crawl found valve bamboo taste broken hundred')
// const wallet = new CoinHDWallets('begin pyramid grit rigid mountain stamp legal item result peace wealth supply satoshi elegant roof identify furnace march west chicken pen gorilla spot excuse')

console.log(wallet.mnemonic)
console.log(wallet.instance)

wallet.generateWallet()
wallet.exportPrivateKey()
// wallet.signTransaction()
wallet.signMessage("APPLE")
wallet.getAccounts()

module.exports = CoinHDWallets
