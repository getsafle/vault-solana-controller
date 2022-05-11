const ObservableStore = require('obs-store')
const solanaWeb3 = require('@solana/web3.js');
const nacl = require('tweetnacl');
const bs58 = require('bs58');

const { solana: { HD_PATH }, solana_transaction: { NATIVE_TRANSFER, TOKEN_TRANSFER, CONTRACT_TRANSACTION, MINT_NEW_TOKEN }, solana_connection: { MAINNET } } = require('./config')

/**
 * HD_PATH TO CHECK
 * m/44'/501'/${idx}'/0'
 * m/44'/501'/0'/${idx}'
 */


const helper = require('./helper')

class KeyringController {

  /**
   * 
   * @param {mnemonic, network} opts
   * network = TESTNET | MAINNET 
   */
  constructor(opts) {
    this.store = new ObservableStore({ mnemonic: opts.mnemonic, hdPath: HD_PATH, network: helper.getNetwork(opts.network), networkType: opts.network ? opts.network : MAINNET.NETWORK, wallet: null, address: [] })
    this.importedWallets = []
  }

  async addAccount() {
    const { mnemonic, address } = this.store.getState();
    const accountDetails = helper.setupAccount(mnemonic, helper.getHDPath(address.length))
    const _address = accountDetails.publicKey.toString()
    this.persistAllAddress(_address)
    return { address: _address }
  }

  async getAccounts() {
    const { address } = this.store.getState();
    return address
  }

  async exportPrivateKey(_address) {
    const { mnemonic, address } = this.store.getState()

    const idx = address.indexOf(_address)
    if (idx < 0)
      throw "Invalid address, the address is not available in the wallet"

    const accountDetails = helper.setupAccount(mnemonic, helper.getHDPath(idx))

    // Works on sollet
    // console.log("`[${Array.from(wallet.provider.account.secretKey)}]` ", `[${Array.from(accountDetails.secretKey)}]`)

    // secret key buffer
    // console.log("accountDetails.secretKey ", accountDetails.secretKey)

    // secret key string
    // return { privateKey: bs58.encode(accountDetails.secretKey) };

    return { privateKey: bs58.encode(accountDetails.secretKey) };

  }

  async importWallet(_privateKey) {
    try {
      const address = helper.importAccount(_privateKey)
      this.importedWallets.push(address.publicKey.toString());
      return address.publicKey.toString()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /**
   * NATIVE_TXN : { data : {to, amount}, txnType: NATIVE_TRANSFER, from }
   * TOKEN_TXN : { data : {
            to, // destination address
            amount // amount to send
            memo // any memo send by user
            token // token address
        }, txnType: TOKEN_TRANSFER, from }
   * CONTRACT_TXN : { data : {programAccountKey, programId, bufferData}, txnType: CONTRACT_TRANSACTION, from }
   * MINT_NEW_TOKEN: {data: {
   *        amount: 1000, // amount
   *        decimals: 2, // decimal places
   * }, txnType: MINT_NEW_TOKEN, from}
   *     
   */
  /**
   *  
   * @param {object: NATIVE_TXN | TOKEN_TXN | CONTRACT_TXN | MINT_NEW_TOKEN} transaction 
   * @returns 
   */
  async signTransaction(transaction) {
    const { mnemonic, address, network, networkType } = this.store.getState()

    const { from } = transaction
    const idx = address.indexOf(from)
    if (idx < 0)
      throw "Invalid address, the address is not available in the wallet"

    try {
      const signer = helper.setupAccount(mnemonic, helper.getHDPath(idx))
      const connection = new solanaWeb3.Connection(network, "confirmed")

      const isMainnet = networkType === MAINNET.NETWORK ? true : false

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
    } catch (err) {
      throw err
    }
  }

  async signMessage(message, _address) {
    const { mnemonic, network, address } = this.store.getState()
    const idx = address.indexOf(_address);
    if (idx < 0)
      throw "Invalid address, the address is not available in the wallet"
    try {
      const accountDetails = helper.setupAccount(mnemonic, helper.getHDPath(idx))
      const msg = bs58.encode(Buffer.from(message))
      return { signedMessage: bs58.encode(nacl.sign.detached(bs58.decode(msg), accountDetails.secretKey)) };
    } catch (err) {
      throw err
    }
  }

  /**
   *  
   * @param {Buffer || UInt8Array} rawTransaction 
   * @returns 
   */
  async sendTransaction(rawTransaction) {

    const { network } = this.store.getState()

    const connection = new solanaWeb3.Connection(network, "confirmed")
    const transactionDetails = await connection.sendRawTransaction(rawTransaction)

    return { transactionDetails: transactionDetails }
  }

  async getFee() {
    const { network, networkType } = this.store.getState()

    const connection = new solanaWeb3.Connection(network, "confirmed")
    const block = await connection.getRecentBlockhash()
    return { transactionFees: block.feeCalculator.lamportsPerSignature }
  }

  persistAllAddress(_address) {
    const { address } = this.store.getState()
    let newAdd = address
    newAdd.push(_address)
    this.store.updateState({ address: newAdd })
    return true
  }
  updatePersistentStore(obj) {
    this.store.updateState(obj)
    return true
  }

}

const getBalance = async (address, networkType) => {
  try {
    const network = helper.getNetwork(networkType)
    const connection = new solanaWeb3.Connection(network, "confirmed")
    const accInfo = await connection.getAccountInfo(new solanaWeb3.PublicKey(address))
    return { balance: accInfo.lamports }
  } catch (err) {
    throw err
  }
}

module.exports = { KeyringController, getBalance }