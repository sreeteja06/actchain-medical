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
const BlockDecoder = require( 'fabric-client/lib/BlockDecoder' );
const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );

async function test( orgName, userName ) {
   let gateway;
   try {
      const ccpPath = path.join(
         __dirname,
         'config',
         orgName,
         'connectionProfile.json'
      );
      const ccpJSON = fs.readFileSync( ccpPath, 'utf8' );
      const ccp = JSON.parse( ccpJSON.toString() );

      const walletPath = path.join( __dirname, 'helpers','wallet', orgName );
      const wallet = new FileSystemWallet( walletPath );
      console.log( `Wallet path: ${ walletPath }` );

      const userExists = await wallet.exists( userName );
      if ( !userExists ) {
         console.log(
            'An identity for the user ' + userName + ' does not exist in the wallet'
         );
         console.log( 'Run the registerUser.js application before retrying' );
         throw new Error( 'An identity for the user ' + userName + ' does not exist in the wallet' );
      }

      gateway = new Gateway();
      await gateway.connect( ccp, {
         wallet,
         identity: userName,
         discovery: { enabled: false }
      } );

      let client = gateway.getClient();
      let peer = "peer0.manu1.meditrack.com";
      let channels = await client.queryChannels(peer, true);
      const network = await gateway.getNetwork( "meditrack" );
      // const channel = await network.getChannel();
      // const orderer = channel.getOrderers();
      // const request = {
      //    orderer: orderer[0],
      //    txId: client.newTransactionID(true) // Get an admin based transactionID
      // };
      // const block = await channel.queryBlock(7, peer, true);
      // const height = await channel.queryInfo(peer, true);
      // console.log(height);
      // const txId = block.data.data[0].payload.header.channel_header.tx_id;
      // const txDetails = await channel.queryTransaction(txId, peer, true);
      // console.log( txDetails.transactionEnvelope.payload.header.signature_header);
      // console.log( block.data.data[0].payload.data.actions );
   } catch ( error ) {
      console.error( `Failed to evaluate transaction: ${ error }` );
      return error
   }
}

test("manu1", "admin");