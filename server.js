require("dotenv").config();
const startNode = require("./startNode.js");
const crypto = require("hypercore-crypto");
const b4a = require("b4a");

const keyPair = crypto.keyPair(crypto.data(b4a.from(process.env.SEED)));
console.log("PUBLICKEY FOR API " + keyPair.publicKey.toString("hex"));

const run = async () => {
  const nodes = ["task", "fetch", "test", "wikipedia", "google"];
  if (process.env.DISCORD_TOKEN) {
    nodes.push("discord");
  }
  if (process.env.OPENAI_API_KEY) {
    nodes.push("openai");
  }
  for (let nodeName of nodes) {
    startNode(keyPair, "hype", nodeName);
  }
};

run();