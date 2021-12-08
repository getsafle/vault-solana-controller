import "regenerator-runtime/runtime";
import { PublicKey, Keypair, Transaction, SystemProgram, Connection } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import * as bip39 from "bip39";
import axios from "axios";
import * as nacl from "tweetnacl";

/**
 * generate multiple accounts using a single mnemonic
 * @param mnemonic required 
 * @param i optional, default 0
 * @param password optional, default empty string 
 * @returns a solana account
 */
export function fromMnemonicToAccounts(mnemonic, i = 0, password = "") {
    const seed = bip39.mnemonicToSeedSync(mnemonic, password); // (mnemonic, password)
    const path = `m/44'/501'/${i}'/0'`;
    const keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
    return keypair;
}

/**
 * Export keys for all the wallets
 * @param keypair required 
 * @returns publicKey and privateKey
 */
export function exportKeys(keypair) {
    const privateKey = Buffer.from(keypair.secretKey).toString("hex");
    const publicKey = keypair.publicKey._bn.toString("hex");
    return { publicKey, privateKey };
}

/**
 * Sign transactions
 * @param from required 
 * @param to required
 * @param privateKey required
 * @param amount required
 * @param recentBlockhash required
 * @returns a serializeMsg which can be broadcast to the solana network
 */
export function signTransaction(params) {
    const {
        from, to, recentBlockhash, amount, privateKey
    } = params;

    const feePayer = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, "hex")));

    // construct a txn obj
    let tx = new Transaction();
    const fromPubkey = new PublicKey(from);
    const toPubkey = new PublicKey(to);

    tx.add(
        SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: amount,
        })
    );

    tx.feePayer = fromPubkey;
    tx.recentBlockhash = recentBlockhash;

    // sign offline
    tx.sign(feePayer);
    const serializeMsg = tx.serialize().toString("base64");

    return serializeMsg;
}

/**
 * Sign Messages
 * solana uses ed25519 as its curve, per the official documentation: https://docs.solana.com/integrations/exchange#valid-ed25519-pubkey-check
 * therefore, use any lib you like, the main idea is to use ed25519 to sign it.
 * the return signature should be 64 bytes.
 * @param dateNeedToSign required 
 * @param privateKey required
 * @returns a signed hex string which can be verified by the privateKey
 */
export function signMessage(params) {
    const { dateNeedToSign, privateKey } = params;

    const feePayer = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, "hex")));
    let signedMessage = nacl.sign.detached(Buffer.from(dateNeedToSign), feePayer.secretKey);

    return Buffer.from(signedMessage).toString("hex");
};


/**
 * Broadcast transactions
 * @param url required 
 * @param serializeMsg required
 * @returns transaction hash or error message
 */
export async function sendRawTx(url, serializeMsg) {
    const connection = new Connection(url);
    try {
        // https://docs.solana.com/terminology#transaction-id
        const txhash = await connection.sendEncodedTransaction(serializeMsg);
        return txhash;
    } catch (error) {
        return Promise.reject(
            new Error(
                // @ts-ignore
                `Transaction submission failed. Server responded: ${error}. ${JSON.stringify(error?.response?.data?.extras?.result_codes)}`,
            )
        )
    }
}

/**
 * Get network fees
 * @param url required 
 * @returns lamportsPerSignature. This method returns the lamports per signature, currently 5000 lamports.
 * For example, a transaction has two signers, hence two signature.
 * Therefore this transaction costs 10000 lamports. The network fees are 10000 lamports.
 */
export async function fetchNetworkFees(url) {
    return axios.post(
        url,
        {
            jsonrpc: "2.0",
            method: "getFees",
            id: 1
        },
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    ).then((response) => {
        return response?.data?.result?.value?.feeCalculator?.lamportsPerSignature;
    });
}
