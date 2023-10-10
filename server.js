const fs = require('fs')
require("dotenv").config()
const crypto = require("hypercore-crypto");
const startNode = require("./startNode.js")
console.log(process.argv)
const node = require("hyper-ipc-secure")();
const rootKey = { publicKey: Buffer.from(process.argv[2], 'hex') }
let hostKey = crypto.keyPair();
try {
  hostKey = JSON.parse(fs.readFileSync('hostKey.json'))
  hostKey.publicKey = Buffer.from(hostKey.publicKey, 'hex')
  hostKey.secretKey = Buffer.from(hostKey.secretKey, 'hex')
}catch(e) {
  fs.writeFileSync('hostKey.json', JSON.stringify(hostKey))
}

console.log('host key')
console.log(hostKey)
node.announce(rootKey.publicKey.toString('hex'), hostKey);
let nodes = [];

const run = async (params) => {
  for (let n of params.nodes) {
    const sub = node.getSub(hostKey, 'calls');
    sub.publicKey=sub.publicKey.toString('hex');
    sub.scalar=sub.scalar.toString('hex');
    console.log('starting node')
    const newNode = await startNode(sub, n.callKey, "hype", n.name, params.args || [], params.env);
    console.log('started node')
    newNode.callKey = n.callKey;
    nodes.push(newNode)
  }
  return { nodes };
}
run({ nodes: JSON.parse(fs.readFileSync('nodes.json')) })
node.serve(hostKey, "startNode", async (params) => {
  console.log('startNode', params)
  await run(params)
  console.log(nodes);
  fs.writeFileSync('nodes.json', JSON.stringify(nodes))
})
console.log(hostKey.publicKey.toString('hex'))
node.serve(hostKey, "getNodes", (input) => {
  return { nodes }
})