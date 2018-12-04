// (C) 2018 Internet of Coins / Gijs-Jan van Dompseler / Joachim de Koning
// Deterministic encryption wrapper for Dash

var StellarSdk = require('stellar-sdk');

var wrapper = (
  function () {


    var functions = {
      // create deterministic public and private keys based on a seed
      // https://stellar.github.io/js-stellar-sdk/Keypair.html
      keys : function(data) {
        var hash = window.nacl.to_hex(nacl.crypto_hash_sha256(data.seed));
        var secret = Buffer.from(hash.substr(0,32), 'utf8');
        var keyPair = StellarSdk.Keypair.fromRawEd25519Seed(secret);
        return {publicKey: keyPair.publicKey(), privateKey: keyPair.secret()};
      },


      // generate a unique wallet address from a given public key
      address : function(data) {
        return data.publicKey;
      },

      // return public key
      publickey : function(data) {
        return data.publicKey;
      },

      // return private key
      privatekey : function(data) {
        return data.privateKey;
      },

      transaction: function(data,callback){
        var sequence = data.unspent;
        var source = new StellarSdk.Account(data.source_address, sequence);
        StellarSdk.Network.usePublicNetwork();

        var transaction = new StellarSdk.TransactionBuilder(source)
            .addOperation(StellarSdk.Operation.payment({
              destination: data.target_address,
              amount: String(data.amount),
              asset: StellarSdk.Asset.native()
            }))
            .build();
        var keyPair = StellarSdk.Keypair.fromSecret(data.keys.privateKey);

        transaction.sign(keyPair);
        return transaction.toEnvelope().toXDR('base64').replace(/\//g, '*');

      }
    }
    return functions;
  }
)();

// export the functionality to a pre-prepared var
window.deterministic = wrapper;