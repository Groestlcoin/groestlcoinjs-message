# groestlcoinjs-message

## Examples

``` javascript
var bitcoin = require('groestlcoinjs-lib') // v4.x.x
var bitcoinMessage = require('groestlcoinjs-message')
```

> sign(message, privateKey, compressed[, network.messagePrefix, sigOptions])
> - If you pass the sigOptions arg instead of messagePrefix it will dynamically replace.
> - sigOptions contains two attributes
>   - `segwitType` should be one of `'p2sh(p2wpkh)'` or `'p2wpkh'`
>   - `extraEntropy` will be used to create non-deterministic signatures using the RFC6979 extra entropy parameter. R value reuse is not an issue.

Sign a Groestlcoin message
``` javascript
var keyPair = bitcoin.ECPair.fromWIF('5JvMTbrwCEs3vd857GR7PtvpewiHcZQSro7eaqJodmr5Ygddtwk')
var privateKey = keyPair.privateKey
var message = 'This is an example of a signed message.'

var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)
console.log(signature.toString('base64'))
// => valid signature
```

To produce non-deterministic signatures you can pass an extra option to sign()
``` javascript
var { randomBytes } = require('crypto')
var keyPair = bitcoin.ECPair.fromWIF('5JvMTbrwCEs3vd857GR7PtvpewiHcZQSro7eaqJodmr5Ygddtwk')
var privateKey = keyPair.privateKey
var message = 'This is an example of a signed message.'

var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed, { extraEntropy: randomBytes(32) })
console.log(signature.toString('base64'))
// => different (but valid) signature each time
```

Sign a Groestlcoin message (with segwit addresses)
``` javascript
// P2SH(P2WPKH) address 'p2sh(p2wpkh)'
var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed, { segwitType: 'p2sh(p2wpkh)' })
console.log(signature.toString('base64'))
// => valid signature

// P2WPKH address 'p2wpkh'
var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed, { segwitType: 'p2wpkh' })
console.log(signature.toString('base64'))
// => valid signature
```

> verify(message, address, signature[, network.messagePrefix])

Verify a Groestlcoin message
``` javascript
var address = 'FYaQj3UMkGfostbARMr55KktqCKqGXikt9'

console.log(bitcoinMessage.verify(message, address, signature))
// => true
```

## LICENSE [MIT](LICENSE)
