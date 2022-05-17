const BufferLayout = require('buffer-layout')
const { PublicKey, TransactionInstruction, SYSVAR_RENT_PUBKEY } = require('@solana/web3.js');
const { solana_program_id: { TOKEN_PROGRAM_ID, OWNER_VALIDATION_PROGRAM_ID, MEMO_PROGRAM_ID } } = require('../config/index')

const LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'));
LAYOUT.addVariant(
    0,
    BufferLayout.struct([
        BufferLayout.u8('decimals'),
        BufferLayout.blob(32, 'mintAuthority'),
        BufferLayout.u8('freezeAuthorityOption'),
        BufferLayout.blob(32, 'freezeAuthority'),
    ]),
    'initializeMint',
);
LAYOUT.addVariant(1, BufferLayout.struct([]), 'initializeAccount');
LAYOUT.addVariant(
    7,
    BufferLayout.struct([BufferLayout.nu64('amount')]),
    'mintTo',
);
LAYOUT.addVariant(
    8,
    BufferLayout.struct([BufferLayout.nu64('amount')]),
    'burn',
);
LAYOUT.addVariant(9, BufferLayout.struct([]), 'closeAccount');
LAYOUT.addVariant(
    12,
    BufferLayout.struct([BufferLayout.nu64('amount'), BufferLayout.u8('decimals')]),
    'transferChecked',
);

const instructionMaxSpan = Math.max(
    ...Object.values(LAYOUT.registry).map((r) => r.span),
);

function encodeTokenInstructionData(instruction) {
    let b = Buffer.alloc(instructionMaxSpan);
    let span = LAYOUT.encode(instruction, b);
    return b.slice(0, span);
}

function initializeMint({
    mint,
    decimals,
    mintAuthority,
    freezeAuthority,
}) {
    let keys = [
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    return new TransactionInstruction({
        keys,
        data: encodeTokenInstructionData({
            initializeMint: {
                decimals,
                mintAuthority: mintAuthority.toBuffer(),
                freezeAuthorityOption: !!freezeAuthority,
                freezeAuthority: (freezeAuthority || PublicKey.default).toBuffer(),
            },
        }),
        programId: TOKEN_PROGRAM_ID,
    });
}

function initializeAccount({ account, mint, owner }) {
    let keys = [
        { pubkey: account, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: owner, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    return new TransactionInstruction({
        keys,
        data: encodeTokenInstructionData({
            initializeAccount: {},
        }),
        programId: TOKEN_PROGRAM_ID,
    });
}

function transferChecked({ source, mint, destination, amount, decimals, owner }) {
    let keys = [
        { pubkey: source, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: destination, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: false },
    ];
    return new TransactionInstruction({
        keys,
        data: encodeTokenInstructionData({
            transferChecked: { amount, decimals },
        }),
        programId: TOKEN_PROGRAM_ID,
    });
}

function mintTo({ mint, destination, amount, mintAuthority }) {
    let keys = [
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: destination, isSigner: false, isWritable: true },
        { pubkey: mintAuthority, isSigner: true, isWritable: false },
    ];
    return new TransactionInstruction({
        keys,
        data: encodeTokenInstructionData({
            mintTo: {
                amount,
            },
        }),
        programId: TOKEN_PROGRAM_ID,
    });
}

function memoInstruction(memo) {
    return new TransactionInstruction({
        keys: [],
        data: Buffer.from(memo, 'utf-8'),
        programId: MEMO_PROGRAM_ID,
    });
}

class PublicKeyLayout extends BufferLayout.Blob {
    constructor(property) {
        super(32, property);
    }

    decode(b, offset) {
        return new PublicKey(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function publicKeyLayout(property) {
    return new PublicKeyLayout(property);
}

const OWNER_VALIDATION_LAYOUT = BufferLayout.struct([
    publicKeyLayout('account'),
]);

function encodeOwnerValidationInstruction(instruction) {
    const b = Buffer.alloc(OWNER_VALIDATION_LAYOUT.span);
    const span = OWNER_VALIDATION_LAYOUT.encode(instruction, b);
    return b.slice(0, span);
}

function assertOwner({ account, owner }) {
    const keys = [{ pubkey: account, isSigner: false, isWritable: false }];
    return new TransactionInstruction({
        keys,
        data: encodeOwnerValidationInstruction({ account: owner }),
        programId: OWNER_VALIDATION_PROGRAM_ID,
    });
}

module.exports = {
    initializeMint,
    initializeAccount,
    mintTo,
    memoInstruction,
    transferChecked,
    assertOwner
}