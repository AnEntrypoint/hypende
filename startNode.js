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
  console.log("Starting node:", node.getSub(serverKey, IPCNAME).publicKey.toString("hex"), IPCNAME);

  // Convert SERVERKEY and CALLKEY to hex strings
  const SERVERKEY = Buffer.from(JSON.stringify(serverKey)).toString("hex");
  const CALLKEY = Buffer.from(JSON.stringify(callKey)).toString("hex");

  // Start the child process using the npx command
  const child = spawn("npx", ["-y", prefix + IPCNAME + "@latest", ...args], {
    shell: true,
    stdio: "inherit",
    env: {
      ...process.env,
      ...env,
      SERVERKEY,
      CALLKEY,
      IPCNAME
    },
  });
  
  // Handle graceful shutdown of the child process
  goodbye(async () => {
    console.log("Stopping node:", node.getSub(keyPair, ipcName).publicKey.toString("hex"), ipcName);
    await new Promise((res) => {
      kill(child.pid, {
        signal: ["SIGINT", "SIGKILL"],
        retryCount: 1,
        retryInterval: 1e4,
        timeout: 11e3
      }, res);
    });
  });
  return {name:ipcName, publicKey:callKey.publicKey, prefix, args}
};

module.exports = startNode;