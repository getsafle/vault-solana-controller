const BufferLayout = require('buffer-layout')
const { PublicKey } = require('@solana/web3.js');

const ACCOUNT_LAYOUT = BufferLayout.struct([
    BufferLayout.blob(32, 'mint'),
    BufferLayout.blob(32, 'owner'),
    BufferLayout.nu64('amount'),
    BufferLayout.blob(93),
]);

const MINT_LAYOUT = BufferLayout.struct([
    BufferLayout.blob(44),
    BufferLayout.u8('decimals'),
    BufferLayout.blob(37),
]);

function parseTokenAccountData(data) {
    let { mint, owner, amount } = ACCOUNT_LAYOUT.decode(data);
    return {
        mint: new PublicKey(mint),
        owner: new PublicKey(owner),
        amount,
    };
}

function parseMintData(data) {
    let { decimals } = MINT_LAYOUT.decode(data);
    return { decimals };
}

function getOwnedAccountsFilters(publicKey) {
    return [
        {
            memcmp: {
                offset: ACCOUNT_LAYOUT.offsetOf('owner'),
                bytes: publicKey.toBase58(),
            },
        },
        {
            dataSize: ACCOUNT_LAYOUT.span,
        },
    ];
}

module.exports = {
    ACCOUNT_LAYOUT,
    MINT_LAYOUT,
    parseTokenAccountData,
    parseMintData,
    getOwnedAccountsFilters
}