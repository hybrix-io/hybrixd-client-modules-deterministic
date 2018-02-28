// (C) 2017 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - ethereum/deterministic.js
// Deterministic encryption wrapper for NXT


var wrapper = (
    function() {

        var Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);

        function encode(data) {
            return '0x' + (new Function('wrapperlib', 'data', 'return function(data.func,data.' + data.vars.join(',data.') + ');'))(wrapperlib, data).toString('hex');
        }


        var functions = {

            keys: function(data) {

                var seedKey = Waves.Seed.fromExistingPhrase(data.seed);
                //take the mnemonic (seed) and convert to publicKey ??
                console.log(seedKey);
                var privateKey = seedKey.keyPair.privateKey;
                var publicKey = seedKey.keyPair.publicKey;

                return {
                    publicKey: publicKey,
                    secretPhrase: privateKey // or privateKey ??
                }

            },

            address: function(data) {
                var seed = Waves.Seed.fromExistingPhrase(data.seed);
                return seed.address;
            },

            transaction: function(data) {
                var seed = Waves.Seed.fromExistingPhrase(data.seed);
                if (data.mode != 'token') {
                    // set the parameters
                    var txParams = { // optional-> data: payloadData
                        recipient: data.toAddr,
                        // ID of a token, or WAVES
                        assetId: 'WAVES',
                        // The real amount is the given number divided by 10^(precision of the token)
                        amount: parseInt(data.amount).toString(16),
                        // The same rules for these two fields
                        feeAssetId: 'WAVES',
                        fee: 100000,
                        // 140 bytes of data (it's allowed to use Uint8Array here)
                        attachment: data.message,
                        timestamp: Date.now()
                    };
                } else {
                    // TEST: var encoded = encode({'func':'balanceOf(address):(uint256)','vars':['target'],'target':data.target});
                    var encoded = encode({
                        'func': 'transfer(address,uint256):(bool)',
                        'vars': ['target', 'amount'],
                        'target': data.target,
                        'fee_to_pay': '100000',
                        'amount': parseInt(data.amount).toString(16)
                    }); // returns the encoded binary (as a Buffer) data to be
                    // set the parameters
                    var txParams = {
                        //is nonce needed?
                        nonce: '0x' + parseInt(data.unspent.nonce).toString(16), // nonce
                        to: data.toAddr, // send payload to contract address
                        value: '0x' + parseInt(0).toString(16), // set to zero, since we're sending tokens
                        data: encoded // payload as encoded using the smart contract
                    };
                }
                var wavesResponse = Waves.API.Node.v1.assets.transfer(txParams, seed.keyPair).then((responseData) => {
                    return responseData;
                });
                // DEBUG: return encoded;
                return wavesResponse;
            },

            // encode ABI smart contract calls
            encode: function(data) {
                return encode(data);
            }
        }

        return functions;
    }
)();

// export the functionality to a pre-prepared var
deterministic = wrapper;
