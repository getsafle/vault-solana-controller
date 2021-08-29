const { Transaction, SystemProgram } = require('@solana/web3.js');
const { MINT_LAYOUT, ACCOUNT_LAYOUT } = require('./layoutParser')
const { initializeMint, initializeAccount, mintTo } = require('./bufferInstructions')
const { solana_program_id: { TOKEN_PROGRAM_ID } } = require('../config/index')

async function createAndInitializeMint({
    connection,
    owner,
    mint,
    amount,
    decimals,
    initialAccount
}) {
    let transaction = new Transaction();
    transaction.add(
        SystemProgram.createAccount({
            fromPubkey: owner.publicKey,
            newAccountPubkey: mint.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(
                MINT_LAYOUT.span,
            ),
            space: MINT_LAYOUT.span,
            programId: TOKEN_PROGRAM_ID,
        }),
    );
    transaction.add(
        initializeMint({
            mint: mint.publicKey,
            decimals,
            mintAuthority: owner.publicKey,
        }),
    );
    let signers = [mint];
    if (amount > 0) {
        transaction.add(
            SystemProgram.createAccount({
                fromPubkey: owner.publicKey,
                newAccountPubkey: initialAccount.publicKey,
                lamports: await connection.getMinimumBalanceForRentExemption(
                    ACCOUNT_LAYOUT.span,
                ),
                space: ACCOUNT_LAYOUT.span,
                programId: TOKEN_PROGRAM_ID,
            }),
        );
        signers.push(initialAccount);
        transaction.add(
            initializeAccount({
                account: initialAccount.publicKey,
                mint: mint.publicKey,
                owner: owner.publicKey,
            }),
        );
        transaction.add(
            mintTo({
                mint: mint.publicKey,
                destination: initialAccount.publicKey,
                amount,
                mintAuthority: owner.publicKey,
            }),
        );
    }

    return { txn: transaction, mintSigners: signers };
}

module.exports = createAndInitializeMint