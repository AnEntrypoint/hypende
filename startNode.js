const { spawn } = require("child_process");
const goodbye = require('graceful-goodbye')
const kill = require('kill-with-style')
const startNode = async (kp, prefix, IPCNAME, args=[])=>{
    const node = require('hyper-ipc-secure')();
    console.log('starting:', node.getSub(kp, IPCNAME).publicKey.toString('hex'), IPCNAME)
    const SERVERKEY = Buffer.from(JSON.stringify(node.getSub(kp, 'firstnode'))).toString('hex');
    const CALLKEY =  Buffer.from(JSON.stringify(node.getSub(kp, IPCNAME))).toString('hex');
    const child = spawn('npx', ['-y', prefix+IPCNAME+"@latest", ...args], {shell:true,  stdio: 'inherit', env:{...process.env, SERVERKEY, CALLKEY, IPCNAME}}); 
    goodbye(async () => {
        console.log('stopping:', node.getSub(kp, IPCNAME).publicKey.toString('hex'), IPCNAME)
        await new Promise( res=>{ kill(child.pid, {
        signal: ["SIGINT", "SIGKILL"],
        retryCount: 1,
        retryInterval: 10000,
        timeout: 11000
    }, res) } )})
}

module.exports = startNode;
