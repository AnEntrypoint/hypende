require('dotenv').config()
const startNode = require('./startNode.js')
const crypto = require('hypercore-crypto')
const b4a = require('b4a')
const kp = crypto.keyPair(crypto.data(b4a.from(process.env.SEED)))
console.log('PUBLICKEY FOR API '+kp.publicKey.toString('hex'))
const run = async ()=>{
    const nodes = ['task','fetch','test']
    for(let name of nodes) {
            startNode(kp, "hype", name);
    }
}
run()
