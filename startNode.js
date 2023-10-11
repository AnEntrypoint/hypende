/**
 * This file contains the startNode function, which is used to start a node.
 * It requires the child_process, graceful-goodbye, and kill-with-style packages.
 * The startNode function takes a key pair, a prefix, an IPCNAME, and optional arguments.
 * It starts a child process using the npx command with the specified prefix and IPCNAME.
 * It sets environment variables for SERVERKEY, CALLKEY, and IPCNAME.
 * It handles graceful shutdown of the child process using graceful-goodbye and kill-with-style.
 */
const {
  spawn
} = require("child_process");
const goodbye = require("graceful-goodbye");
const kill = require("kill-with-style");
const fs = require('fs')
const children = {};
/**
 * Function to start a node
 * @param {Object} keyPair - Key pair generated using hypercore-crypto or keypear
 * @param {string} prefix - Prefix for the IPC command
 * @param {string} ipcName - Name of the IPC (Inter-Process Communication) call
 * @param {Array} args - Optional arguments for the npx command
 */
const startNode = async (serverKey, callKey, prefix, ipcName, args = [], env) => {
  const node = require("hyper-ipc-secure")();
  const IPCNAME = ipcName;
  // Log the public key and IPCNAME of the node being started
  console.log("Starting node:", IPCNAME);

  // Convert SERVERKEY and CALLKEY to hex strings
  console.log(JSON.stringify(serverKey),JSON.stringify(callKey))
  const SERVERKEY = Buffer.from(JSON.stringify(serverKey)).toString("hex");
  const CALLKEY = Buffer.from(JSON.stringify(callKey)).toString("hex");

  // Start the child process using the npx command
  console.log('installing', IPCNAME);
  const first = spawn("npm", ["install", "-y", prefix + IPCNAME + "@latest", ...args], {
    shell: true,
    stdio: "inherit",
  });
  await new Promise(res=>{
    first.on('exit', (exitCode) => {
      res();
    })
  })
  console.log('installed', IPCNAME, 'starting', env);
  try {
    fs.mkdirSync('server-'+serverKey)
  } catch(e) {

  }
  const child = spawn("npx", ["-y", prefix + IPCNAME + "@latest", ...args], {
    shell: true,
    stdio: "inherit",
    cwd:'server-'+serverKey,
    env: {
      ...process.env,
      ...env,
      SERVERKEY,
      CALLKEY,
      IPCNAME
    },
  });
  children[child.pid] = child;
  // Handle graceful shutdown of the child process

  return {name:ipcName, publicKey:callKey.publicKey, prefix, args}
};
goodbye(async () => {
  for(child of Object.values(children)) {
    console.log("Stopping node:", child.pid);
    const res = await new Promise((res) => {
      kill(child.pid, {
        signal: ["SIGINT"],
        retryCount: 2,
        retryInterval: 10000,
        timeout: 20000
      }, res);
    });
    console.log("Node stopped", child.pid);
  }
});

module.exports = startNode;