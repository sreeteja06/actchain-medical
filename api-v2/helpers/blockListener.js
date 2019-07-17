/*
 *     _____________  ___  
      / ___/ ___/ _ \/ _ \ 
     (__  ) /  /  __/  __/ 
    /____/_/   \___/\___  
 * File Created: Wednesday, 17th July 2019 12:21:51 pm
 * Author: SreeTeja06 (sreeteja.muthyala@gmail.com)

 * There are two ways to write error-free programs; only the third one works.
 * And remeber it is not a bug, it is an undocumented feature
 */
const { FileSystemWallet, Gateway } = require( 'fabric-network' );
const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );

async function blockListener(
    channelName,
    orgName,
    userName
) {
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

        const gateway = new Gateway();
        await gateway.connect( ccp, {
            wallet,
            identity: userName,
            discovery: { enabled: false }
        } );
        const network = await gateway.getNetwork( channelName );
        const listener = await network.addBlockListener(
            'my-block-listener',
            ( err, block ) => {
                if ( err ) {
                    console.error( err );
                    return;
                }
                console.log( util.inspect( block ) );
            }
        );
    } catch ( e ) {
        console.log( e );
    }
}

module.exports = blockListener;
