const { SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction, PublicKey, SystemProgram } = require('@solana/web3.js');
const { solana_program_id: { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, SYSTEM_PROGRAM_ID } } = require('../config/index')
const { transferChecked, assertOwner, memoInstruction } = require("./bufferInstructions")

async function _createAssociatedTokenAccountIx(
    fundingAddress,
    walletAddress,
    splTokenMintAddress,
) {
    const associatedTokenAddress = await _findAssociatedTokenAddress(
        walletAddress,
        splTokenMintAddress,
    );
    const systemProgramId = SYSTEM_PROGRAM_ID;
    const keys = [
        {
            pubkey: fundingAddress,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: walletAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: splTokenMintAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: systemProgramId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    const ix = new TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
    return [ix, associatedTokenAddress];
}

async function _findAssociatedTokenAddress(
    walletAddress,
    tokenMintAddress,
) {
    return (
        await PublicKey.findProgramAddress(
            [
                walletAddress.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                tokenMintAddress.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID,
        )
    )[0];
}

async function transferTokens({
    connection,
    owner,
    sourcePublicKey,
    destinationPublicKey,
    amount,
    memo,
    mint,
    decimals,
    overrideDestinationCheck
}, isMainnet) {
    let destinationAccountInfo = await connection.getAccountInfo(destinationPublicKey);
    if (
        !!destinationAccountInfo &&
        destinationAccountInfo.owner.equals(TOKEN_PROGRAM_ID)
    ) {
        return await _transferBetweenSplTokenAccounts({
            connection,
            owner,
            mint,
            decimals,
            sourcePublicKey,
            destinationPublicKey,
            amount,
            memo,
        });
    }

    if (
        (!destinationAccountInfo || destinationAccountInfo.lamports === 0) &&
        !overrideDestinationCheck
    ) {
        throw new Error('Cannot send to address with zero SOL balances');
    }

    const destinationAssociatedTokenAddress = await _findAssociatedTokenAddress(
        destinationPublicKey,
        mint,
    );
    destinationAccountInfo = await connection.getAccountInfo(
        destinationAssociatedTokenAddress,
    );
    if (
        !!destinationAccountInfo &&
        destinationAccountInfo.owner.equals(TOKEN_PROGRAM_ID)
    ) {
        return await _transferBetweenSplTokenAccounts({
            connection,
            owner,
            mint,
            decimals,
            sourcePublicKey,
            destinationPublicKey: destinationAssociatedTokenAddress,
            amount,
            memo,
        });
    }
    return await _createAndTransferToAccount({
        connection,
        owner,
        sourcePublicKey,
        destinationPublicKey,
        amount,
        memo,
        mint,
        decimals,
    }, isMainnet);
}

function _createTransferBetweenSplTokenAccountsInstruction({
    ownerPublicKey,
    mint,
    decimals,
    sourcePublicKey,
    destinationPublicKey,
    amount,
    memo,
}) {
    let transaction = new Transaction().add(
        transferChecked({
            source: sourcePublicKey,
            mint,
            decimals,
            destination: destinationPublicKey,
            owner: ownerPublicKey,
            amount,
        }),
    );
    if (memo) {
        transaction.add(memoInstruction(memo));
    }
    return transaction;
}

async function _transferBetweenSplTokenAccounts({
    connection,
    owner,
    mint,
    decimals,
    sourcePublicKey,
    destinationPublicKey,
    amount,
    memo,
}) {
    const transaction = _createTransferBetweenSplTokenAccountsInstruction({
        ownerPublicKey: owner.publicKey,
        mint,
        decimals,
        sourcePublicKey,
        destinationPublicKey,
        amount,
        memo,
    });

    return transaction
}

async function _createAndTransferToAccount({
    connection,
    owner,
    sourcePublicKey,
    destinationPublicKey,
    amount,
    memo,
    mint,
    decimals,
}, isMainnet) {
    const [
        createAccountInstruction,
        newAddress,
    ] = await _createAssociatedTokenAccountIx(
        owner.publicKey,
        destinationPublicKey,
        mint,
    );
    let transaction = new Transaction();
    if (isMainnet)
        transaction.add(
            assertOwner({
                account: destinationPublicKey,
                owner: SYSTEM_PROGRAM_ID,
            }),
        );
    transaction.add(createAccountInstruction);
    const transferBetweenAccountsTxn = _createTransferBetweenSplTokenAccountsInstruction(
        {
            ownerPublicKey: owner.publicKey,
            mint,
            decimals,
            sourcePublicKey,
            destinationPublicKey: newAddress,
            amount,
            memo,
        },
    );
    transaction.add(transferBetweenAccountsTxn);
    return transaction;
}

module.exports = transferTokens