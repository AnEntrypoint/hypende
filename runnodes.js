import startNode from './startNode.js'
const kp = crypto.keyPair(crypto.data(b4a.from('seedy')));
const nodes = ['task','fetch','test']
for(let name of nodes) {
    startNode(kp, "hype"+name);
}
