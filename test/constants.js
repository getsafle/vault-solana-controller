module.exports = {
    HD_WALLET_12_MNEMONIC: 'affair entry detect broom axis crawl found valve bamboo taste broken hundred',
    HD_WALLET_24_MNEMONIC: 'begin pyramid grit rigid mountain stamp legal item result peace wealth supply satoshi elegant roof identify furnace march west chicken pen gorilla spot excuse',

    SOLANA_NETWORK: {
        MAINNET: {
            NETWORK: "MAINNET",
            URL: 'https://api.mainnet-beta.solana.com',
        },

        TESTNET: {
            NETWORK: "TESTNET",
            URL: 'https://api.testnet.solana.com',
        },
        DEVNET: {
            NETWORK: "DEVNET",
            URL: 'https://api.devnet.solana.com'
        }
    },

    TRANSACTION_TYPE: {
        NATIVE_TRANSFER: "NATIVE_TRANSFER",
        TOKEN_TRANSFER: "TOKEN_TRANSFER",
        CONTRACT_TRANSACTION: "CONTRACT_TRANSACTION",
        MINT_NEW_TOKEN: "MINT_NEW_TOKEN"
    },

    CONTRACT_TRANSACTION_PARAM: {
        PROGRAM_ACCOUNT_KEY: '1od2KNAmBXGHYkSZAyUaMLXYFtB5qgjKAXUBSCEnSqF',
        PROGRAM_ID: '6DLywiF4Rsk11TLo9YGDxDqLQh1Wq8duk14RA4YCVe3c',
        BUFFER_DATA: Buffer.alloc(0)
    },

    TRANSFER_SOL: {
        SOL_RECEIVER: '71H3rBodCbkMSNDg4vzoH7tmdQmpY8h8SEe4UY6ZujYS',
        SOL_AMOUNT: 100000000
    },

    TRANSFER_TOKEN: {
        TOKEN_RECEIVER: '88wVRVjUmECbL3VoyGq8KXd9cS5jKrWeqWp2XZ8ytiWJ',
        EMPTY_TOKEN_RECEIVER: '45VuieK8WqX2LMMiTE3CZ7rwgQBrrKgMTjn7VsgVJB2B',
        TOKEN_AMOUNT: 100000000,
        TOKEN_MEMO: null || 'RANDOM_MEMO',
        TOKEN_ADDRESS: 'DNYi986YnVSFNkPTyd7shgmNdSsPfyrYz3irNyMTVHo3',
        CHECK_FOR_EMPTY_RECEIVER: true,
        NO_CHECK_FOR_EMPTY_RECEIVER: false
    },

    MINT_TOKEN: {
        MINT_AMOUNT: 1000000,
        MINT_DECIMAL: 3
    },

    TESTING_MESSAGE_1: "ThisMessageOneIsForTesting",
    TESTING_MESSAGE_2: "This_message_two_is_for_testing",
    TESTING_MESSAGE_3: "This message three is for testing"

}