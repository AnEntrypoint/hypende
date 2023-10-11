const fs = require('fs')

require("dotenv").config()

const filename = 'nodes.json';

if (!fs.existsSync(filename)) {
  fs.writeFileSync(filename, '[]', 'utf-8');
  console.log(`File '${filename}' created with an empty array.`);
} else {
  console.log(`File '${filename}' already exists.`);
}

const crypto = require("hypercore-crypto");
const startNode = require("./startNode.js")
console.log(process.argv)
const node = require("hyper-ipc-secure")();
const rootKey = { publicKey: Buffer.from(process.argv[2], 'hex') }
let hostKey = crypto.keyPair();
try {
  hostKey = JSON.parse(fs.readFileSync('hostKey.json'))
  console.log(hostKey)
  hostKey.publicKey = Buffer.from(hostKey.publicKey, 'hex')
  hostKey.secretKey = Buffer.from(hostKey.secretKey, 'hex')
}catch(e) {
  console.error(e)
  fs.writeFileSync('hostKey.json', JSON.stringify({publicKey:hostKey.publicKey.toString('hex'), secretKey:hostKey.secretKey.toString('hex')}))
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
    console.log('starting node', n.env)
    const newNode = await startNode(sub, n.callKey, "hype", n.name, n.args || [], n.env);
    newNode.env = n.env;
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
  fs.writeFileSync('nodes.json', JSON.stringify(nodes))
})
console.log(hostKey.publicKey.toString('hex'))
node.serve(hostKey, "getNodes", (input) => {
  return { nodes }
})