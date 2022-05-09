const { solana_connection: { MAINNET, TESTNET, DEVNET } } = require('../config/index')

function getActiveNetwork(_network) {
    return _network === TESTNET.NETWORK ? TESTNET.URL : _network === DEVNET.NETWORK ? DEVNET.URL : MAINNET.URL
}

module.exports = getActiveNetwork