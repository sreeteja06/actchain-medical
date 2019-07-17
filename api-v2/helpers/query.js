/*
 *     _____________  ___  
      / ___/ ___/ _ \/ _ \ 
     (__  ) /  /  __/  __/ 
    /____/_/   \___/\___  
 * File Created: Tuesday, 16th July 2019 11:19:10 am
 * Author: SreeTeja06 (sreeteja.muthyala@gmail.com)

 * There are two ways to write error-free programs; only the third one works.
 * And remeber it is not a bug, it is an undocumented feature
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function query( functionName, args,channelName, contractName, orgName, userName) {
  try {
    const ccpPath = path.join(
      __dirname,
      '..',
      'config',
      orgName,
      'connectionProfile.json'
    );
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(ccpJSON.toString());

    const walletPath = path.join(__dirname, 'wallet', orgName);
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.exists(userName);
    if (!userExists) {
      console.log(
        'An identity for the user ' + userName + ' does not exist in the wallet'
      );
      console.log('Run the registerUser.js application before retrying');
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: { enabled: false }
    });
    const network = await gateway.getNetwork(channelName);

    const contract = network.getContract(contractName);

    const result = await contract.evaluateTransaction(functionName, args);

    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    process.exit(1);
  }
}

module.exports = query;