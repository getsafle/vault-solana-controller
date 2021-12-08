import "regenerator-runtime/runtime";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import * as nacl from "tweetnacl";

import {
    fromMnemonicToAccounts,
    exportKeys,
    signTransaction,
    signMessage,
    sendRawTx,
    fetchNetworkFees,
} from "../";

import { dev, } from "./mock-data";
const { url } = dev;

let connection;

/**

    check: generate multiple accounts using a single mnemonic
    check: Export keys for all the wallets
    check: Sign transactions
    check: Sign messages
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

        // export the publicKey and the privateKey
        const { publicKey, privateKey } = exportKeys(account);
        console.log("publicKey: " + publicKey);
        console.log("privateKey: " + privateKey);
    }
});

test('sign transaction and broadcast it', async () => {
    const recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    const { privateKey, from, to, amount, } = require("./mock-data");

    try {
        const serializeMsg = signTransaction({
            from, amount, to, recentBlockhash, privateKey
        });
        console.log("serializeMsg: " + serializeMsg);

        // broadcast rawT
        const txhash = await sendRawTx(url, serializeMsg);
        console.log("txhash: " + txhash);

    } catch (error) {
        throw new Error(`Sign transaction error：` + error);
    }
});

test('sign message', async () => {
    const { privateKey, } = require("./mock-data");

    try {
        const dateNeedToSign = "string address";
        const signedMessage = signMessage({
            dateNeedToSign, privateKey
        });
        console.log("signedMessage: " + signedMessage);

        // you can verify signatures
        const feePayer = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, "hex")));
        let verifyMessage = nacl.sign.detached.verify(
            Buffer.from(dateNeedToSign),
            Buffer.from(signedMessage, "hex"),
            feePayer.publicKey.toBytes() // you should use the raw pubkey (32 bytes) to verify
        );
        console.log(`verify message validify: ${verifyMessage}`);

    } catch (error) {
        throw new Error(`Sign Message error：` + error);
    }
});

test('fetch network fees', async () => {
    try {
        const networkFees = await fetchNetworkFees(url);
        console.log("networkFees: " + networkFees);
    } catch (error) {
        throw new Error(error.response.data);
    }
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