const {PublicKey} = require("@solana/web3.js")
const { parseTokenAccountData, getOwnedAccountsFilters } = require('./layoutParser')
const { solana_program_id: { TOKEN_PROGRAM_ID } } = require('../config/index')

async function getOwnedTokenAccounts(connection, publicKey) {
    let filters = getOwnedAccountsFilters(publicKey);
    let resp = await connection.getProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
            filters,
        },
    );
    return resp
        .map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
            publicKey: new PublicKey(pubkey),
            accountInfo: {
                data,
                executable,
                owner: new PublicKey(owner),
                lamports,
            },
        }))
}

async function getTokenAccountInfo(connection, publicKey) {
    let accounts = await getOwnedTokenAccounts(connection, publicKey);
    return accounts
        .map(({ publicKey, accountInfo }) => {
            return { publicKey, parsed: parseTokenAccountData(accountInfo.data) };
        })
        .sort((account1, account2) =>
            account1.parsed.mint
                .toBase58()
                .localeCompare(account2.parsed.mint.toBase58()),
        );
};

function checkToken(tokenInfo, token) {
    for (const t of tokenInfo) {
        if (t.parsed.mint.toString() === token)
            return { availableToken: true, tokenAccount: t.publicKey }
    }
    return { availableToken: false, tokenAccount: null }
}

module.exports = {
    getOwnedTokenAccounts,
    getTokenAccountInfo,
    checkToken
}