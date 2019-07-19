/*
 *     _____________  ___  
      / ___/ ___/ _ \/ _ \ 
     (__  ) /  /  __/  __/ 
    /____/_/   \___/\___  
 * File Created: Wednesday, 17th July 2019 10:27:35 am
 * Author: SreeTeja06 (sreeteja.muthyala@gmail.com)

 * There are two ways to write error-free programs; only the third one works.
 * And remeber it is not a bug, it is an undocumented feature
 */
'use strict';

const { FileSystemWallet, Gateway } = require( 'fabric-network' );
const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );

async function invoke( functionName, args, channelName, contractName, orgName, userName ) {
    let gateway;
    try {
        const ccpPath = path.join(
            __dirname,
            '..',
            'config',
            orgName,
            'connectionProfile.json'
        );
        const ccpJSON = fs.readFileSync( ccpPath, 'utf8' );
        const ccp = JSON.parse( ccpJSON.toString() );

        const walletPath = path.join( __dirname, 'wallet', orgName );
        const wallet = new FileSystemWallet( walletPath );
        console.log( `Wallet path: ${ walletPath }` );

        const userExists = await wallet.exists( userName );
        if ( !userExists ) {
            console.log(
                'An identity for the user ' + userName + ' does not exist in the wallet'
            );
            console.log( 'Run the registerUser.js application before retrying' );
            return;
        }

        gateway = new Gateway();
        await gateway.connect( ccp, {
            wallet,
            identity: userName,
            discovery: { enabled: false }
        } );
        const network = await gateway.getNetwork( channelName );

        const contract = network.getContract( contractName );

        let txId, status, blockNo;

        let tx = await contract.createTransaction( functionName );
        let proResolve;
        let pro = new Promise( ( resolve, reject ) => {
            proResolve = resolve;
        } );
        const lis = await tx.addCommitListener( ( err, transactionId, status, blockNumber ) => {
            if ( err ) {
                console.error( err );
                proResolve();
                return;
            }
            txId = transactionId;
            status = status;
            blockNo = blockNumber;
            proResolve();
            console.log( `Transaction ID: ${ transactionId } Status: ${ status } Block number: ${ blockNumber }` );
        } )
        args = JSON.stringify( args );
        let result = await tx.submit( args );
        console.log(
            `Transaction has been submitted, result is: ${ result.toString() }`
        );
        await pro
        return {
            result: result.toString(),
            txId,
            status,
            blockNo
        }
    } catch ( error ) {
        console.error( `Failed to evaluate transaction: ${ error }` );
        return error
    } finally {
        if ( gateway ) {
            await gateway.disconnect();
        }
    }
}

module.exports = invoke;