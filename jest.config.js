module.exports = {
    // setupTestFrameworkScriptFile has been deprecated in
    // favor of setupFilesAfterEnv in jest 24
    setupFilesAfterEnv: ['./jest.setup.js'],
    globals: {
        Uint8Array: Uint8Array,
        TextEncoder: require('util').TextEncoder,
        TextDecoder: require('util').TextDecoder,
    },
}