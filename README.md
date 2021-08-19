# Solana-wallet

This repository contains `SOLHdKeyring` class to create **Solana wallet** from **Safle Vault**.

## Usecase

We will be using `SolHdKeyring` class to initialize the wallet and then utilize the provided functions to perform the required tasks. 

The class initialization is done in the following way.

```
const solWallet = new SolHdKeyring(`mnemonic`)
```

`mnemonic` is the BIP-39 key phrase to generate the wallet.

Once we initialize the class, we can utilize the provided functions. 


The wallet have the following functions:

#### generateWallet()
This function is used to generate the Solana wallet and set the 0th address as the default address. 

parameters: -

returns: `{address : wallet_address}`

#### exportPrivateKey()
This function is used to export the provate key for the generated address.

parameters: -

returns: `private_key`

#### signTransaction(transaction: *Array<Transaction | TransactionInstruction | TransactionInstructionCtorFields>* )
This function is used to sign a transaction off-chain and then send it to the network.<br />
parameters: 

```
name: transaction,
type: Transaction : new Transaction(opts?: TransactionCtorFields) | TransactionInstruction : new TransactionInstruction(opts: TransactionInstructionCtorFields) | TransactionInstructionCtorFields : {data?: Buffer; keys: AccountMeta[]; programId: PublicKey}
```
returns: `{address : wallet_address}`


#### signMessage(message: *string* )
This function is used to sign a message.

parameters: 
```
name: message
type: string
```

returns: `signed_message`

#### getAccounts()
This function is used to get the wallet address

parameters: -

returns: `{address : wallet_address}`
