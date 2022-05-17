const bip39 = require('bip39');
const { derivePath } = require('ed25519-hd-key');
const nacl = require('tweetnacl');
const { Account } = require('@solana/web3.js');

function _getAccountDetailsFromSeed(seed, dPath) {
    const derivedSeed = derivePath(dPath, seed).key;
    const account = new Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
    return account;
}

function manageSeedandGetAccountDetails(mnemonic, hdPath) {
    const normalizeMnemonic = mnemonic.trim().split(/\s+/g).join(" ")
    const seedHex = bip39.mnemonicToSeedHex(normalizeMnemonic)
    return _getAccountDetailsFromSeed(
        Buffer.from(seedHex, 'hex'),
        hdPath,
    );
}

module.exports = manageSeedandGetAccountDetails