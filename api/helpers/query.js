var util = require('util');
var helper = require('./connection.js');

var queryChaincode = async function(peers, channelName, chaincodeName, args, fcn, username, orgName) {
	try {
		// setup the client for this org
		var client = await helper.getClientForOrg(orgName, username);
		console.log('============ START queryChaincode - Successfully got the fabric client for the organization "%s"', orgName);
		var channel = client.getChannel(channelName);
		if(!channel) {
			let message = util.format('##### queryChaincode - Channel %s was not defined in the connection profile', channelName);
			console.log(message);
			throw new Error(message);
		}

		// send query
		var request = {
			targets : peers, 
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: [JSON.stringify(args)]
		};

		console.log('##### queryChaincode - Query request to Fabric %s', JSON.stringify(request));
		let responses = await channel.queryByChaincode(request);
        let ret = [];
		if (responses) {
            // you may receive multiple responses if you passed in multiple peers. For example,
            // if the targets : peers in the request above contained 2 peers, you should get 2 responses
			for (let i = 0; i < responses.length; i++) {
                console.log('##### queryChaincode - result of query: ' + responses[i].toString('utf8') + '\n');
			}
			// check for error
			let response = responses[0].toString('utf8');
			console.log('##### queryChaincode - type of response: %s', typeof response);
			if (responses[0].toString('utf8').indexOf("Error: transaction returned with failure") != -1) {
				let message = util.format('##### queryChaincode - error in query result: %s', responses[0].toString('utf8'));
				console.log(message);
				throw new Error(message);	
			}
            // we will only use the first response. We strip out the Fabric key and just return the payload
            let json = JSON.parse(responses[0].toString('utf8'));
			console.log('##### queryChaincode - Query json %s', util.inspect(json));
			if (Array.isArray(json)) {
				for (let key in json) {
					if (json[key]['Record']) {
						ret.push(json[key]['Record']); 
					} 
					else {
						ret.push(json[key]); 
					}
				}
			}
			else {
				ret.push(json); 
			}
 			return ret;
		} 
		else {
			console.log('##### queryChaincode - result of query, responses is null');
			return 'responses is null';
		}
	} 
	catch(error) {
		console.log('##### queryChaincode - Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};

exports.queryChaincode = queryChaincode;
