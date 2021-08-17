/* eslint-disable no-nested-ternary */
const hexEncoding = require('crypto-js/enc-hex')
const RIPEMD160 = require('crypto-js/ripemd160')
const SHA256 = require('crypto-js/sha256')
const { bech32 } = require('bech32')
const createHmac = require("create-hmac/browser");
const hashjs = require('hash.js')
const hdkey = require('hdkey')
const bip39 = require('bip39')
// const assets = require('@getsafle/assets')

const Coins = require('../coin')

const { stellar: { ED25519_CURVE, HARDENED_OFFSET } } = require('../config')

async function ab2hexstring(arr) {
  if (typeof arr !== 'object') {
    throw new Error('ab2hexstring expects an array')
  }
  let result = ''
  for (let i = 0; i < arr.length; i++) {
    let str = arr[i].toString(16)
    str = str.length === 0 ? '00' : str.length === 1 ? `0${str}` : str
    result += str
  }
  return result
}

async function sha256ripemd160 (hex) {
  if (typeof hex !== 'string') {
    throw new Error('sha256ripemd160 expects a string')
  }
  if (hex.length % 2 !== 0) {
    throw new Error(`invalid hex string length: ${hex}`)
  }
  const hexEncoded = hexEncoding.parse(hex)
  const programSha256 = SHA256(hexEncoded)
  return RIPEMD160(programSha256).toString()
}

async function encodeAddress (value, prefix = 'bnb', type = 'hex') {
  let words
  if (Buffer.isBuffer(value)) {
    words = bech32.toWords(Buffer.from(value))
  } else {
    words = bech32.toWords(Buffer.from(value, type))
  }
  return bech32.encode(prefix, words)
}

async function bech32ify(address, prefix) {
  const words = bech32.toWords(Buffer.from(address, 'hex'))
  return bech32.encode(prefix, words)
}

async function leftPadString(stringToPad, padChar, length) {
  let repeatedPadChar = '';

  for (let i = 0; i < length; i++) {
    repeatedPadChar += padChar;
  }

  return ((repeatedPadChar + stringToPad).slice(-length));
}

async function derivePath (path, seed) {
    if (!isValidPath(path)) {
        throw new Error('Invalid derivation path');
    }
    const { key, chainCode } = await getMasterKeyFromSeed(seed);
    const segments = path
        .split('/')
        .slice(1)
        .map(replaceDerive)
        .map(el => parseInt(el, 10));
    return segments.reduce(
        (parentKeys, segment) =>
            CKDPriv(parentKeys, segment + HARDENED_OFFSET),
        { key, chainCode }
    );
};

async function getMasterKeyFromSeed(seed) {
    const hmac = createHmac('sha512', ED25519_CURVE);
    const I = hmac.update(Buffer.from(seed, 'hex')).digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR,
    };
};

function CKDPriv({ key, chainCode }, index) {
    const indexBuffer = Buffer.allocUnsafe(4);
    indexBuffer.writeUInt32BE(index, 0);
    const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);
    const I = createHmac('sha512', chainCode)
        .update(data)
        .digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR,
    };
};

const replaceDerive = (val) => val.replace("'", '');
const pathRegex = new RegExp("^m(\\/[0-9]+')+$");
const isValidPath = (path) => {
    if (!pathRegex.test(path)) {
        return false;
    }
    return !path
        .split('/')
        .slice(1)
        .map(replaceDerive)
        .some(isNaN);
};

async function computePublicKeyHash (publicKeyBytes) {
  const hash256 = hashjs.sha256().update(publicKeyBytes).digest()

  const hash160 = hashjs.ripemd160().update(hash256).digest()
  return Buffer.from(hash160)
}

async function getCoinInstance(coinName, mnemonic) {
  const { chainId } = 501
  const hdPath = `m/44'/${chainId}'/0'/0`
  const seed = bip39.mnemonicToSeed(mnemonic)
  const hdWallet = hdkey.fromMasterSeed(seed)

  const coinInstance = new Coins[coinName](mnemonic, hdPath)

  return { hdWallet, coinInstance }
}

async function getSolanaInstance(mnemonic) {
  const hdPath = `m/44'/501'/0'/0'`
  const seed = bip39.mnemonicToSeed(mnemonic)
  const hdWallet = hdkey.fromMasterSeed(seed)

  return hdWallet
}

async function getTezosInstance(mnemonic) {
  const hdPath = `m/44'/501'/0'/0'`
  const seed = bip39.mnemonicToSeed(mnemonic)
  const hdWallet = hdkey.fromMasterSeed(seed)

  return hdWallet
}

module.exports = { ab2hexstring, sha256ripemd160, encodeAddress, bech32ify, leftPadString, derivePath, computePublicKeyHash, getCoinInstance, getSolanaInstance, getTezosInstance  }
