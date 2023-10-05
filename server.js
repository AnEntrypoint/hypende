require("dotenv").config()
const crypto = require("hypercore-crypto");
const b4a = require("b4a");

const startNode = require("./startNode.js")
console.log(process.argv)
const node = require("hyper-ipc-secure")();
const rootKey = {publicKey:Buffer.from(process.argv[2], 'hex')}
const hostKey = crypto.keyPair();
console.log('root key')
console.log(rootKey.publicKey.toString('hex'))
node.announce(rootKey.publicKey.toString('hex'), hostKey);
const fs = require('fs')
let nodes=[];
try {
  nodes = JSON.parse(fs.readFileSync('nodes.json'))
}catch(e) {}

const run = async (params) => {
  const nodes = params.nodes
  const out = {nodes:[]}
  console.log(nodes);
  for (let n of nodes) {
    console.log(n);
    out.nodes.push(await startNode(node.getSub(hostKey, 'calls'), n.callKey, "hype", n.name, params.args||[], params.env))
  }
  return out
}
node.serve(hostKey, "startNode", (params)=>{
  run(params)
  fs.writeFileSync('nodes.json', JSON.stringify(nodes))
})
console.log(hostKey.publicKey.toString('hex'))
node.serve(hostKey, "getNodes", (input)=>{
  return {nodes}
})