import { spawn } from "child_process";

const startNode = async (kp, IPCNAME, args=[])=>{
    console.log('running: ', IPCNAME)
    const SERVERKEY = Buffer.from(process.env.SERVERKEY||JSON.stringify(node.getSub(kp, 'firstnode'))).toString('hex');
    const CALLKEY =  Buffer.from(JSON.stringify(node.getSub(kp, IPCNAME))).toString('hex');
    console.log({SERVERKEY, CALLKEY})
    console.log(SERVERKEY)
    spawn('npx', ['-y', IPCNAME, ...args], {shell:true,  stdio: 'inherit', env:{...process.env, SERVERKEY, CALLKEY, IPCNAME}}); 
}
module.exports = startNode;
