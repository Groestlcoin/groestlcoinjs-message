const test = require('tape').test
const bs58check = require('bs58grscheck')
const bech32 = require('bech32')
const createHash = require('create-hash')
const bitcoin = require('groestlcoinjs-lib')
const BigInteger = require('bigi')
const message = require('../')

const fixtures = require('./fixtures.json')

function getMessagePrefix (networkName) {
  return fixtures.networks[networkName]
}

fixtures.valid.magicHash.forEach(f => {
  test(
    'produces the magicHash for "' + f.message + '" (' + f.network + ')',
    t => {
      const actual = message.magicHash(f.message, getMessagePrefix(f.network))
      t.same(actual.toString('hex'), f.magicHash)
      t.end()
    }
  )
})

fixtures.valid.sign.forEach(f => {
  test('sign: ' + f.description, t => {
    const pk = new bitcoin.ECPair(new BigInteger(f.d)).d.toBuffer(32)
    let signature = message.sign(
      f.message,
      pk,
      false,
      getMessagePrefix(f.network)
    )
    t.same(signature.toString('base64'), f.signature)

    if (f.compressed) {
      signature = message.sign(f.message, pk, true, getMessagePrefix(f.network))
      t.same(signature.toString('base64'), f.compressed.signature)
    }

    if (f.segwit) {
      if (f.segwit.P2SH_P2WPKH) {
        signature = message.sign(
          f.message,
          pk,
          true,
          getMessagePrefix(f.network),
          { segwitType: 'p2sh(p2wpkh)' }
        )
        t.same(signature.toString('base64'), f.segwit.P2SH_P2WPKH.signature)
      }
      if (f.segwit.P2WPKH) {
        signature = message.sign(
          f.message,
          pk,
          true,
          getMessagePrefix(f.network),
          { segwitType: 'p2wpkh' }
        )
        t.same(signature.toString('base64'), f.segwit.P2WPKH.signature)
      }
    }

    t.end()
  })
})

fixtures.valid.signElectrum.forEach(f => {
  test('signElectrum: ' + f.description, t => {
    const pk = new bitcoin.ECPair(new BigInteger(f.d)).d.toBuffer(32)
    let signature = message.sign(
      f.message,
      pk,
      false,
      getMessagePrefix(f.network)
    )
    t.same(signature.toString('base64'), f.signature)

    if (f.compressed) {
      signature = message.sign(f.message, pk, true, getMessagePrefix(f.network))
      t.same(signature.toString('base64'), f.compressed.signature)
    }

    if (f.segwit) {
      if (f.segwit.P2SH_P2WPKH) {
        signature = message.signElectrum(
          f.message,
          pk,
          true,
          getMessagePrefix(f.network),
          { segwitType: 'p2sh(p2wpkh)' }
        )
        t.same(signature.toString('base64'), f.segwit.P2SH_P2WPKH.signature)
      }
      if (f.segwit.P2WPKH) {
        signature = message.signElectrum(
          f.message,
          pk,
          true,
          getMessagePrefix(f.network),
          { segwitType: 'p2wpkh' }
        )
        t.same(signature.toString('base64'), f.segwit.P2WPKH.signature)
      }
    }

    t.end()
  })
})

fixtures.valid.verify.forEach(f => {
  test(
    'verifies a valid signature for "' + f.message + '" (' + f.network + ')',
    t => {
      t.true(
        message.verify(
          f.message,
          f.address,
          f.signature,
          getMessagePrefix(f.network)
        )
      )

      if (f.network === 'groestlcoin') {
        // defaults to bitcoin network
        t.true(message.verify(f.message, f.address, f.signature))
      }
      if (f.compressed) {
        t.true(
          message.verify(
            f.message,
            f.compressed.address,
            f.compressed.signature,
            getMessagePrefix(f.network)
          )
        )
      }

      if (f.segwit) {
        if (f.segwit.P2SH_P2WPKH) {
          t.true(
            message.verify(
              f.message,
              f.segwit.P2SH_P2WPKH.address,
              f.segwit.P2SH_P2WPKH.signature,
              getMessagePrefix(f.network)
            )
          )
          t.true(
            message.verify(
              f.message,
              f.segwit.P2SH_P2WPKH.address,
              f.segwit.P2SH_P2WPKH.signature.replace(/^./, 'I'),
              getMessagePrefix(f.network),
              true
            )
          )
        }
        if (f.segwit.P2WPKH) {
          t.true(
            message.verify(
              f.message,
              f.segwit.P2WPKH.address,
              f.segwit.P2WPKH.signature,
              getMessagePrefix(f.network)
            )
          )
          t.true(
            message.verify(
              f.message,
              f.segwit.P2WPKH.address,
              f.segwit.P2WPKH.signature.replace(/^./, 'I'),
              getMessagePrefix(f.network),
              true
            )
          )
        }
      }

      t.end()
    }
  )
})

fixtures.valid.verifyElectrum.forEach(f => {
  test(
    'verifies a valid signature for "' + f.message + '" (' + f.network + ') using Electrum rules',
    t => {
      t.true(
        message.verifyElectrum(
          f.message,
          f.address,
          f.signature,
          getMessagePrefix(f.network)
        )
      )

      if (f.network === 'groestlcoin') {
        // defaults to bitcoin network
        t.true(message.verifyElectrum(f.message, f.address, f.signature))
      }
      if (f.compressed) {
        t.true(
          message.verifyElectrum(
            f.message,
            f.compressed.address,
            f.compressed.signature,
            getMessagePrefix(f.network)
          )
        )
      }

      if (f.segwit) {
        if (f.segwit.P2SH_P2WPKH) {
          t.true(
            message.verifyElectrum(
              f.message,
              f.segwit.P2SH_P2WPKH.address,
              f.segwit.P2SH_P2WPKH.signature,
              getMessagePrefix(f.network)
            )
          )
        }
        if (f.segwit.P2WPKH) {
          t.true(
            message.verifyElectrum(
              f.message,
              f.segwit.P2WPKH.address,
              f.segwit.P2WPKH.signature,
              getMessagePrefix(f.network)
            )
          )
        }
      }

      t.end()
    }
  )
})

fixtures.invalid.signature.forEach(f => {
  test('decode signature: throws on ' + f.hex, t => {
    t.throws(() => {
      message.verify(null, null, Buffer.from(f.hex, 'hex'), null)
    }, new RegExp('^Error: ' + f.exception + '$'))
    t.end()
  })
})

fixtures.invalid.verify.forEach(f => {
  test(f.description, t => {
    t.false(
      message.verify(
        f.message,
        f.address,
        f.signature,
        getMessagePrefix('groestlcoin')
      )
    )
    t.end()
  })
})

fixtures.randomSig.forEach(f => {
  test(f.description, t => {
    const keyPair = bitcoin.ECPair.fromWIF(f.wif)
    const privateKey = keyPair.d.toBuffer(32)
    const address = keyPair.getAddress()
    f.signatures.forEach(s => {
      const signature = message.sign(
        f.message,
        privateKey,
        keyPair.compressed,
        { extraEntropy: Buffer.from(s.sigData, 'base64') }
      )
      t.true(message.verify(f.message, address, signature))
    })
    t.end()
  })
})

test('Check that compressed signatures can be verified as segwit', t => {
  const keyPair = bitcoin.ECPair.makeRandom()
  const privateKey = keyPair.d.toBuffer(32)
  const publicKey = keyPair.getPublicKeyBuffer()
  const publicKeyHash = hash160(publicKey)
  const p2shp2wpkhRedeemHash = segwitRedeemHash(publicKeyHash)
  // get addresses (p2pkh, p2sh-p2wpkh, p2wpkh)
  const p2pkhAddress = keyPair.getAddress()
  const p2shp2wpkhAddress = bs58check.encode(Buffer.concat([
    Buffer.from([5]),
    p2shp2wpkhRedeemHash
  ]))
  const p2wpkhAddress = bech32.encode(
    'bc',
    [0].concat(bech32.toWords(publicKeyHash))
  )

  const msg = 'Sign me'
  const signature = message.sign(msg, privateKey, true)

  // Make sure it verifies
  t.true(message.verify(msg, p2pkhAddress, signature))
  // Make sure it verifies even with checkSegwitAlways
  t.true(message.verify(msg, p2pkhAddress, signature, null, true))

  // Check segwit addresses with true
  t.true(message.verify(msg, p2shp2wpkhAddress, signature, null, true))
  t.true(message.verify(msg, p2wpkhAddress, signature, null, true))
  // Check segwit with false
  t.true(message.verify(msg, p2shp2wpkhAddress, signature) === false)
  t.throws(() => {
    message.verify(msg, p2wpkhAddress, signature)
  }, new RegExp('^Error: Non-base58 character$'))

  const signatureUncompressed = message.sign(msg, privateKey, false)
  t.throws(() => {
    message.verify(msg, p2shp2wpkhAddress, signatureUncompressed, null, true)
  }, new RegExp('^Error: checkSegwitAlways can only be used with a compressed pubkey signature flagbyte$'))

  t.end()
})

function sha256 (b) {
  return createHash('sha256')
    .update(b)
    .digest()
}
function hash160 (buffer) {
  return createHash('ripemd160')
    .update(sha256(buffer))
    .digest()
}
function segwitRedeemHash (publicKeyHash) {
  const redeemScript = Buffer.concat([
    Buffer.from('0014', 'hex'),
    publicKeyHash
  ])
  return hash160(redeemScript)
}
