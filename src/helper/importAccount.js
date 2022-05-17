const { Keypair } = require("@solana/web3.js")
const bs58 = require('bs58');

function importAccount(privateKey) {
    try {
        return Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
    } catch (e) {
        try {
            return Keypair.fromSecretKey(new Uint8Array(bs58.decode(privateKey)));
        } catch (err) {
            return undefined;
        }
    }
}

module.exports = importAccount
