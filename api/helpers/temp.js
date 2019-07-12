const { Peer } = require('fabric-client');

// let orgName = 'manu';
// username = 'M001';

// let config = '../config/connectionProfile.yaml';
// let client = hfc.loadFromConfig(config);

// console.log(client)
let peer = new Peer("grpc://0.0.0.0:7051");
console.log(peer.getName())