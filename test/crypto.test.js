import {sleep} from 'k6'
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

global.window = {}
const forge = require("node-forge")
const CryptoJS = require("crypto-js")

export let options = {
    vus: 1,
    duration: '120s',
}


export default function () {
    sleep(1)
    const randomUUID = uuidv4()
    const keypair = forge.pki.rsa.generateKeyPair({bits: 2048, e: 0x10001});
    const pubKeyPEM = forge.pki.publicKeyToPem(keypair.publicKey);
    const privKeyPEM = forge.pki.privateKeyToPem(keypair.privateKey);
    console.log(pubKeyPEM);
    console.log(privKeyPEM);

    const enc_key = forge.pki.privateKeyFromPem(privKeyPEM)
    const hmacDecrypted = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA512("test", randomUUID));
    console.log(hmacDecrypted)

    const sign_key = forge.pki.privateKeyFromPem(privKeyPEM)
    const md = forge.md.sha256.create();
    md.update(hmacDecrypted);
    const signature = sign_key.sign(md);
    console.log(forge.util.encode64(signature))
}
