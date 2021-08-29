const { PublicKey } = require('@solana/web3.js');

module.exports = {
    solana: {
        HD_PATH: `m/44'/501'/0'/0'`,
    },
    solana_transaction: {
        NATIVE_TRANSFER: "NATIVE_TRANSFER",
        TOKEN_TRANSFER: "TOKEN_TRANSFER",
        CONTRACT_TRANSACTION: "CONTRACT_TRANSACTION",
        MINT_NEW_TOKEN: "MINT_NEW_TOKEN"
    },
    solana_program_id: {
        TOKEN_PROGRAM_ID: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        ASSOCIATED_TOKEN_PROGRAM_ID: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
        WRAPPED_SOL_MINT: new PublicKey('So11111111111111111111111111111111111111112'),
        MEMO_PROGRAM_ID: new PublicKey('Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo'),
        SYSTEM_PROGRAM_ID: new PublicKey('11111111111111111111111111111111'),
        OWNER_VALIDATION_PROGRAM_ID: new PublicKey('4MNPdKu9wFMvEeZBMt3Eipfs5ovVWTJb31pEXDJAAxX5')
    },
    solana_connection: {
        MAINNET: 'https://api.mainnet-beta.solana.com',
        TESTNET: 'https://api.testnet.solana.com',
        DEVNET: 'https://api.devnet.solana.com'
    }
}