const { Keypair } = require("@solana/web3.js")

function importAccount(privateKey) {
    console.log("privateKey ", privateKey)
    try {
        return Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
    } catch (e) {
        console.log("Error ", e)
        try {
            return Keypair.fromSecretKey(new Uint8Array(bs58.decode(privateKey)));
        } catch (err) {
            console.log("Error other", err)

            return undefined;
        }
    }
}

module.exports = importAccount
