/* eslint-disable no-nested-ternary */
const hdkey = require('hdkey')
const bip39 = require('bip39')
const Coin = require('../coin')

const { solana: { HD_PATH } } = require('../config')

function getSolanaInstance(mnemonic) {
  const hdPath = HD_PATH
  const seed = bip39.mnemonicToSeed(mnemonic)
  const hdWallet = hdkey.fromMasterSeed(seed)

  const coinInstance = new Coin(mnemonic, hdPath)

  return coinInstance
}


module.exports = { getSolanaInstance }
