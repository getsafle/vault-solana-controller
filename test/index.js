var assert = require('assert');
const Solana = require('../src/index')
const {
    HD_WALLET_12_MNEMONIC
} = require('./constants')

describe('Initialize wallet ', () => {
    const solWallet = new Solana(HD_WALLET_12_MNEMONIC)

    it("Should have correct mnemonic", () => {
        assert.equal(solWallet.mnemonic, HD_WALLET_12_MNEMONIC, "Incorrect hd wallet" )
    })
})