var assert = require('assert');
const { KeyringController: Solana, getBalance } = require('../src/index')
const {
    HD_WALLET_12_MNEMONIC,
    SOLANA_NETWORK: {
        MAINNET,
        DEVNET,
        TESTNET
    },
    TRANSACTION_TYPE: { NATIVE_TRANSFER,
        TOKEN_TRANSFER,
        CONTRACT_TRANSACTION,
        MINT_NEW_TOKEN
    },
    CONTRACT_TRANSACTION_PARAM: {
        PROGRAM_ACCOUNT_KEY,
        PROGRAM_ID,
        BUFFER_DATA
    },
    TRANSFER_SOL: {
        SOL_RECEIVER,
        SOL_AMOUNT
    },
    TRANSFER_TOKEN: {
        TOKEN_RECEIVER,
        EMPTY_TOKEN_RECEIVER,
        TOKEN_AMOUNT,
        TOKEN_MEMO,
        TOKEN_ADDRESS,
        CHECK_FOR_EMPTY_RECEIVER,
        NO_CHECK_FOR_EMPTY_RECEIVER
    },
    MINT_TOKEN: {
        MINT_AMOUNT,
        MINT_DECIMAL
    },
    TESTING_MESSAGE_1,
    TESTING_MESSAGE_2,
    TESTING_MESSAGE_3
} = require('./constants')

const CONTRACT_TXN_PARAM = {
    transaction: {
        data: {
            programAccountKey: PROGRAM_ACCOUNT_KEY,
            programId: PROGRAM_ID,
            bufferData: BUFFER_DATA
        }, txnType: CONTRACT_TRANSACTION
    },
    connectionUrl: DEVNET
}

const SOL_TXN_PARAM = {
    transaction: {
        data: {
            to: SOL_RECEIVER,
            amount: SOL_AMOUNT,
        }, txnType: NATIVE_TRANSFER
    },
    connectionUrl: DEVNET
}

const TOKEN_TXN_PARAM = {
    transaction: {
        data: {
            to: TOKEN_RECEIVER,
            amount: TOKEN_AMOUNT,
            memo: TOKEN_MEMO,
            token: TOKEN_ADDRESS,
            overrideDestinationCheck: CHECK_FOR_EMPTY_RECEIVER,
        }, txnType: TOKEN_TRANSFER
    },
    connectionUrl: DEVNET
}

const MINT_NEW_TOKEN_PARAM = {
    transaction: {
        data: {
            amount: MINT_AMOUNT,
            decimals: MINT_DECIMAL,
        }, txnType: MINT_NEW_TOKEN
    },
    connectionUrl: DEVNET
}

const opts = {
    mnemonic: HD_WALLET_12_MNEMONIC,
    network: DEVNET.NETWORK
}

describe('Controller test', () => {
    const solWallet = new Solana(opts)

    it("Should generate new address ", async () => {
        const wallet = await solWallet.addAccount()
        console.log("wallet, ", wallet)
        const wallet2 = await solWallet.addAccount()
        console.log("wallet2, ", wallet2)
    })

    it("Should get accounts", async () => {
        const acc = await solWallet.getAccounts()
        console.log("acc ", acc)
        assert(acc.length === 2, "Should have 2 addresses")
    })

    it("Should get privateKey ", async () => {
        const acc = await solWallet.getAccounts()
        const privateKey = await solWallet.exportPrivateKey(acc[0])
        console.log("privateKey, ", privateKey)
    })

    it("Should import new account ", async () => {
        const acc = await solWallet.getAccounts()
        const { privateKey } = await solWallet.exportPrivateKey(acc[0])
        const account = await solWallet.importWallet(privateKey)
        console.log("account, ", account)
        assert(account === acc[0], "Should be the zeroth account")
    })

    it("Should get balance of the address ", async () => {
        const acc = await solWallet.getAccounts()
        console.log("acc ", acc)
        const balance = await getBalance(acc[0], opts.network)
        console.log("balance ", balance)
    })

    it("Should sign SOL transfer transaction ", async () => {
        assert(solWallet.address !== null)
        const acc = await solWallet.getAccounts()
        SOL_TXN_PARAM.transaction['from'] = acc[0]

        const wallet = await solWallet.signTransaction(SOL_TXN_PARAM.transaction)

        const stringWall = wallet.signedTransaction.toString('hex')
        const stringBuff = Buffer.from(stringWall, 'hex')

        const transactionDetails = await solWallet.sendTransaction(wallet.signedTransaction)

        console.log("SOL Transfer transaction hash: ", transactionDetails)
    })

    it("Should sign contract transaction ", async () => {
        assert(solWallet.address !== null)
        const acc = await solWallet.getAccounts()
        CONTRACT_TXN_PARAM.transaction['from'] = acc[0]

        const wallet = await solWallet.signTransaction(CONTRACT_TXN_PARAM.transaction)

        const transactionDetails = await solWallet.sendTransaction(wallet.signedTransaction)

        console.log("Contract transaction hash: ", transactionDetails)
    })

    it("Sign token transfer transaction", async () => {
        const acc = await solWallet.getAccounts()
        TOKEN_TXN_PARAM.transaction['from'] = acc[0]

        const wallet = await solWallet.signTransaction(TOKEN_TXN_PARAM.transaction)

        const transactionDetails = await solWallet.sendTransaction(wallet.signedTransaction)

        console.log("Token Transfer transaction hash: ", transactionDetails)
    })

    it("Sign token minting transaction", async () => {
        const acc = await solWallet.getAccounts()
        MINT_NEW_TOKEN_PARAM.transaction['from'] = acc[0]

        const wallet = await solWallet.signTransaction(MINT_NEW_TOKEN_PARAM.transaction)

        const transactionDetails = await solWallet.sendTransaction(wallet.signedTransaction)

        console.log("Mint token transaction hash: ", transactionDetails)
    })

    it("Sign message", async () => {
        const acc = await solWallet.getAccounts()

        const signedMessage1 = await solWallet.signMessage(TESTING_MESSAGE_1, acc[0])
        console.log("Signed message 1: ", signedMessage1)

        const signedMessage2 = await solWallet.signMessage(TESTING_MESSAGE_2, acc[0])
        console.log("Signed message 2: ", signedMessage2)

        const signedMessage3 = await solWallet.signMessage(TESTING_MESSAGE_3, acc[0])
        console.log("Signed message 3: ", signedMessage3)
    })

})