require("dotenv").config()
const crypto = require("hypercore-crypto");
const goodbye = require("graceful-goodbye");
const startNode = require("./startNode.js")
console.log(process.argv)
const node = require("hyper-ipc-secure")();
const rootKey = { publicKey: Buffer.from(process.argv[2], 'hex') }
const hostKey = crypto.keyPair();
console.log('root key')
console.log(rootKey.publicKey.toString('hex'))
node.announce(rootKey.publicKey.toString('hex'), hostKey);
const fs = require('fs')
let nodes = [];

const run = async (params) => {
  for (let n of params.nodes) {
    const sub = node.getSub(hostKey, 'calls');
    sub.publicKey=sub.publicKey.toString('hex');
    sub.scalar=sub.scalar.toString('hex');
    const newNode = await startNode(sub, n.callKey, "hype", n.name, params.args || [], params.env);
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