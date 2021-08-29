async function sign(transaction, signer, connection, otherSigners) {

    transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
    ).blockhash;

    transaction.sign(signer)
    if (otherSigners.length > 0) {
        transaction.partialSign(...otherSigners);
    }

    const rawTransaction = transaction.serialize();
    return rawTransaction;
}

module.exports = sign