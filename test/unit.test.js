import "regenerator-runtime/runtime";
import { Connection, PublicKey, Keypair, Secp256k1Program } from "@solana/web3.js";
import * as bip39 from "bip39";
const secp256k1 = require('secp256k1');

import {
    fromMnemonicToAccounts,
    exportKeys,
    signTransaction,
    signMessage,
    sendRawTx,
    fetchNetworkFees,
} from "../";

import {
    privateKey, from, to, prod, dev, amount,
} from "./mock-data";
const { url } = dev;

let connection;

/**

    check: generate multiple accounts using a single mnemonic
    check: Export keys for all the wallets
    check: Sign transactions
    Sign messages
    check: Broadcast transactions
    check: Get network fees

 */

beforeAll(async () => {
    connection = new Connection(url);
    const version = await connection.getVersion();
    console.log("Connection to cluster established:", url, version);

    // await requestTestSol("");

});

test('generate multiple accounts using a single mnemonic, and export them', async () => {
    // generate 12 random words
    const mnemonic = bip39.generateMnemonic();
    // generate 5 accounts using a single mnemonic
    for (let i = 0; i < 5; i++) {
        const path = `m/44'/501'/${i}'/0'`;
        const account = fromMnemonicToAccounts(mnemonic, i);
        console.log(`${path} => ${account.publicKey.toBase58()}`);
        const { publicKey, privateKey } = exportKeys(account);
        console.log("publicKey: " + publicKey);
        console.log("privateKey: " + privateKey);
    }
});

test('sign transaction', async () => {
    const recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    try {
        const serializeMsg = signTransaction({
            from, amount, to, recentBlockhash, privateKey
        });
        console.log("serializeMsg: " + serializeMsg);
        // broadcast rawT
        const txhash = await sendRawTx(url, serializeMsg);
        console.log("txhash: " + txhash);
        // expect(response.status===true).toBeTruthy();
    } catch (error) {
        throw new Error(`Sign transaction error：` + error);
    }
    expect(true).toBe(true);
});

test('sign message', async () => {
    const recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    try {
        // Create a Ethereum Address from secp256k1
        let secp256k1PrivateKey;
        do {
            secp256k1PrivateKey = Keypair.generate().secretKey.slice(0, 32);
        } while (!secp256k1.privateKeyVerify(secp256k1PrivateKey));
        let secp256k1PublicKey = secp256k1.publicKeyCreate(secp256k1PrivateKey, false).slice(1);
        let ethAddress = Secp256k1Program.publicKeyToEthAddress(secp256k1PublicKey);

        const serializeMsg = signMessage({
            message: "string address", recentBlockhash, ethAddress, secp256k1PrivateKey, from, privateKey
        });
        console.log("serializeMsg: " + serializeMsg);

        // broadcast rawT
        const txhash = await sendRawTx(url, serializeMsg);
        console.log("txhash: " + txhash);
        // expect(response.status===true).toBeTruthy();
    } catch (error) {
        throw new Error(`Sign transaction error：` + error);
    }
    expect(true).toBe(true);
});

test('fetch network fees', async () => {
    try {
        const networkFees = await fetchNetworkFees(url);
        console.log("networkFees: " + networkFees);
    } catch (error) {
        throw new Error(error.response.data);
    }
    expect(true).toBe(true);
});

async function requestTestSol(address) {
    const publicKey = new PublicKey(address)
    const txhash = await connection.requestAirdrop(publicKey, 1e9);
    console.log(txhash)

    // 等待链上完成交易
    for (; ;) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        let balance = await connection.getBalance(publicKey);
        if (balance != 0) {
            console.log(`feePayer: ${await connection.getBalance(publicKey)}`);
            break;
        }
    }
}