# vault-solana-controller

## Install

`npm install --save @getsafle/vault-solana-controller`

## Initialize the Solana Controller class

```
const { KeyringController, getBalance } = require('@getsafle/vault-solana-controller');

const solanaController = new KeyringController({
    // 12 words mnemonic to create wallet
    mnemonic: string,
    // network - type of network [TESTNET|MAINNET|DEVNET]
    // default is MAINNET even if no network is passed
    network: string (TESTNET | MAINNET | DEVNET)
});
```

## Methods

### Generate Keyring with 1 account or add new account

```
const keyringState = await solanaController.addAccount();
```

### Export the private key of an address present in the keyring

```
const privateKey = await solanaController.exportPrivateKey(address);
```

### Get all accounts in the keyring

```
const privateKey = await solanaController.getAccounts();
```

### Sign a transaction

```
const signedTx = await solanaController.signTransaction(solanaTx: TransactionObj);

solanaTx: {from, to, amount}
```

1. SOL transfer:<br />
   Trasaction to transfer SOL from one wallet/address to another.<br />The transaction object is of the following type:

```
TransactionObj: {
    data: {
        to, // destination address
        amount, // amount
    },
    txnType: NATIVE_TRANSFER, // type constant
    from: // sender address
}
```

2. SPL token transfer:<br />
   Transaction to transfer SPL tokens from one wallet/address to another.<br />The transaction object is of the following type:

```
TransactionObj: {
    data: {
        to, // destination address
        amount // amount to send
        memo // any memo send by user
        token // token address
    },
    txnType: TOKEN_TRANSFER, // type constant
    from: // sender address
}
```

3. Contract transactions:<br />
   Transaction to call any smart contract function.<br />The transaction object is of the following type:

```
TransactionObj: {
    data: {
        programAccountKey, // address at which the program state is managed
        programId, // programId of the contract
        bufferData // data to send in buffer format
    },
    txnType: CONTRACT_TRANSACTION, // type constant
    from: // sender address
}
```

4. Mint new SPL token: <br />
   Transaction to mint new token with initial amount and decimal places.<br />The transaction object is of the following type:

```
TransactionObj: {
    data: {
        amount: 1000, // amount
        decimals: 2, // decimal places
   },
   txnType: MINT_NEW_TOKEN, // type constant
   from: // sender address
}
```

**parameters:**

```
name: transaction,
type: TransactionObj, // refer to the above 4 transactionObj types.
```

**returns:** `{signedTransaction: Buffer} signed raw transaction`

### Sign a message

```
const signedMsg = await solanaController.signMessage(msgString, address);
```

### Get fees

```
const fees = await solanaController.getFee(address);
```

### Get balance

```
const balance = await getBalance(address, network); // if network !== TESTNET then it will fetch mainnet balance
```
