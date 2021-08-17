const SOLHdKeyring = require('./coin/solana')

const { getCoinInstance } = require('./utils/helper')

class CoinHDWallets {
  constructor(mnemonic) {
    this.mnemonic = mnemonic
    this.solanoGenerate()
  }

  async generateWallet(coinName) {
    const { hdWallet, coinInstance } = await getCoinInstance(coinName, this.mnemonic)
    const wallet = coinInstance.generateWallet(hdWallet)

    return wallet
  }

  async exportPrivateKey(coinName) {
    const { hdWallet, coinInstance } = await getCoinInstance(coinName, this.mnemonic)
    const wallet = coinInstance.exportPrivateKey(hdWallet)

    return wallet
  }

  async solanoGenerate() {
    const coinInstance = new SOLHdKeyring(this.mnemonic)
    console.log("coinInstance ", coinInstance)

    const wallet = await coinInstance.generateWallet()
    console.log("wallet ", wallet)

    const walletPK = await coinInstance.exportPrivateKey()
    console.log(" walletPK ", walletPK)
  }

}

// new CoinHDWallets('affair entry detect broom axis crawl found valve bamboo taste broken hundred')
new CoinHDWallets('begin pyramid grit rigid mountain stamp legal item result peace wealth supply satoshi elegant roof identify furnace march west chicken pen gorilla spot excuse')

module.exports = { SOLHdKeyring, CoinHDWallets }
