const solanaWeb3 = require('@solana/web3.js');
const nacl = require('tweetnacl');
const bs58 = require('bs58');

const { solana: { HD_PATH }, solana_transaction: { NATIVE_TRANSFER, TOKEN_TRANSFER, CONTRACT_TRANSACTION, MINT_NEW_TOKEN }, solana_connection: { MAINNET } } = require('./config')

const helper = require('./helper')

class SOLHdKeyring {
  constructor(mnemonic) {
    this.mnemonic = mnemonic
    this.hdPath = HD_PATH
    this.wallet = null
    this.address = null
  }

  async generateWallet() {
    const accountDetails = helper.setupAccount(this.mnemonic, this.hdPath)
    this.address = accountDetails.publicKey.toString()
    return { address: this.address }
  }

  async exportPrivateKey() {
    const accountDetails = helper.setupAccount(this.mnemonic, this.hdPath)
    return { privateKey: accountDetails.secretKey.toString('hex') };
  }

  /**
   * NATIVE_TXN : { data : {to, amount}, txnType: NATIVE_TRANSFER }
   * TOKEN_TXN : { data : {
            to, // destination address
            amount // amount to send
            memo // any memo send by user
            token // token address
        }, txnType: TOKEN_TRANSFER }
   * CONTRACT_TXN : { data : {programAccountKey, programId, bufferData}, txnType: CONTRACT_TRANSACTION }
   * MINT_NEW_TOKEN: {data: {
   *        amount: 1000, // amount
   *        decimals: 2, // decimal places
   * }, txnType: MINT_NEW_TOKEN}
   *     
   */
  /**
   *  
   * @param {object: NATIVE_TXN | TOKEN_TXN | CONTRACT_TXN | MINT_NEW_TOKEN} transaction 
   * @param {string} connectionUrl
   * @returns 
   */
  async signTransaction(transaction, connectionUrl) {
    const signer = helper.setupAccount(this.mnemonic, this.hdPath)
    const connection = new solanaWeb3.Connection(connectionUrl, "confirmed")

    const isMainnet = connectionUrl === MAINNET ? true : false

    const { txnType } = transaction
    if (txnType === NATIVE_TRANSFER) {
      const { to, amount } = transaction.data
      const receiverPublicKey = new solanaWeb3.PublicKey(to);
      const txn = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: signer.publicKey,
          toPubkey: receiverPublicKey,
          lamports: amount,
        }),
      )

      const rawSignedTxn = await helper.signTransaction(txn, signer, connection, [])

      return { signedTransaction: rawSignedTxn };
    }
    else if (txnType === TOKEN_TRANSFER) {

      const { to, amount, memo, token, overrideDestinationCheck } = transaction.data

      const receiverPublicKey = new solanaWeb3.PublicKey(to)
      const tokenPublicKey = new solanaWeb3.PublicKey(token)
      const tokenInfo = await connection.getAccountInfo(tokenPublicKey)

      const { decimals } = helper.layout.parseMintData(tokenInfo.data)

      const INFO = await helper.manageTokenAccounts.getTokenAccountInfo(connection, signer.publicKey)
      const checkCorrectToken = helper.manageTokenAccounts.checkToken(INFO, token)
      if (!checkCorrectToken.availableToken)
        return

      const sourcePublicKey = checkCorrectToken.tokenAccount

      const txn = await helper.transferToken({
        connection,
        owner: signer,
        sourcePublicKey,
        destinationPublicKey: receiverPublicKey,
        amount,
        memo,
        mint: tokenPublicKey,
        decimals,
        overrideDestinationCheck
      }, isMainnet)

      const rawSignedTxn = await helper.signTransaction(txn, signer, connection, [])

      return { signedTransaction: rawSignedTxn };
    }

    else if (txnType === CONTRACT_TRANSACTION) {

      const { programAccountKey, programId, bufferData } = transaction.data

      const accountKey = new solanaWeb3.PublicKey(programAccountKey);
      const programKey = new solanaWeb3.PublicKey(programId);

      const instruction = new solanaWeb3.TransactionInstruction({
        keys: [{ pubkey: accountKey, isSigner: false, isWritable: true }],
        programId: programKey,
        data: bufferData,
      });

      const txn = new solanaWeb3.Transaction().add(instruction)

      const rawSignedTxn = await helper.signTransaction(txn, signer, connection, [])

      return { signedTransaction: rawSignedTxn };
    }
    else if (txnType === MINT_NEW_TOKEN) {
      const { amount, decimals } = transaction.data
      const mint = new solanaWeb3.Account()
      const initialAccount = new solanaWeb3.Account()

      const { txn, mintSigners } = await helper.mintInitialToken({
        connection,
        owner: signer,
        mint,
        amount,
        decimals,
        initialAccount,
      })

      const rawSignedTxn = await helper.signTransaction(txn, signer, connection, mintSigners)

      return { signedTransaction: rawSignedTxn };
    }
    else {
      return null
    }
  }

  async signMessage(message) {
    const accountDetails = helper.setupAccount(this.mnemonic, this.hdPath)
    const msg = bs58.encode(Buffer.from(message))
    return { signedMessage: bs58.encode(nacl.sign.detached(bs58.decode(msg), accountDetails.secretKey)) };
  }

  async getAccounts() {
    return { address: this.address }
  }

  /**
   *  
   * @param {Buffer || UInt8Array} rawTransaction 
   * @param {string} connectionUrl
   * @returns 
   */
  async sendTransaction(rawTransaction, connectionUrl) {
    const connection = new solanaWeb3.Connection(connectionUrl, "confirmed")
    const transactionDetails = await connection.sendRawTransaction(rawTransaction)

    return { transactionDetails: transactionDetails }
  }

}

module.exports = SOLHdKeyring