import "regenerator-runtime/runtime";
import { PublicKey, Keypair, Transaction, SystemProgram, Connection, Secp256k1Program } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import * as bip39 from "bip39";
import axios from "axios";
const { keccak_256 } = require('js-sha3');
const secp256k1 = require('secp256k1');

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

export function signMessage(params) {
    const { message, secp256k1PrivateKey, from, ethAddress, recentBlockhash, privateKey } = params;

    // Sign Message with Ethereum Key
    let plaintext = Buffer.from(message);
    let plaintextHash = Buffer.from(keccak_256.update(plaintext).digest());
    let { signature, recid: recoveryId } = secp256k1.ecdsaSign(
        plaintextHash,
        secp256k1PrivateKey
    );

    // Create transaction to verify the signature
    let tx = new Transaction().add(
        Secp256k1Program.createInstructionWithEthAddress({
            ethAddress: ethAddress.toString('hex'),
            // @ts-ignore
            plaintext,
            signature,
            recoveryId,
        }),
    );
    tx.feePayer = new PublicKey(from);
    tx.recentBlockhash = recentBlockhash;
    // sign offline
    const feePayer = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, "hex")));
    tx.sign(feePayer);
    const serializeMsg = tx.serialize().toString("base64");
    return serializeMsg;
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
