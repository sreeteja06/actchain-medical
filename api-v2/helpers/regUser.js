/*
 *     _____________  ___  
      / ___/ ___/ _ \/ _ \ 
     (__  ) /  /  __/  __/ 
    /____/_/   \___/\___  
 * File Created: Tuesday, 16th July 2019 12:21:44 pm
 * Author: SreeTeja06 (sreeteja.muthyala@gmail.com)

 * There are two ways to write error-free programs; only the third one works.
 * And remeber it is not a bug, it is an undocumented feature
 */
const FabricCAServices = require( 'fabric-ca-client' );
const {
  FileSystemWallet,
  Gateway,
  X509WalletMixin
} = require( 'fabric-network' );
const fs = require( 'fs' );
const path = require( 'path' );

const regAdmin = async orgName => {
  var appAdmin = 'admin';
  var appAdminSecret = 'adminpw';
  var orgMSPID = orgName + 'MSP';
  var caURL = 'http://ca.' + orgName + '.meditrack.com:7054';
  try {
    const ca = new FabricCAServices( caURL );
    const walletPath = path.join( __dirname, 'wallet', orgName );
    const wallet = new FileSystemWallet( walletPath );
    console.log( `Wallet path: ${ walletPath }` );
    const adminExists = await wallet.exists( appAdmin );
    if ( adminExists ) {
      console.log(
        'An identity for the admin user "admin" already exists in the wallet'
      );
      return 'already admin exists';
    }
    const enrollment = await ca.enroll( {
      enrollmentID: appAdmin,
      enrollmentSecret: appAdminSecret
    } );
    const identity = X509WalletMixin.createIdentity(
      orgMSPID,
      enrollment.certificate,
      enrollment.key.toBytes()
    );
    wallet.import( appAdmin, identity );
    console.log(
      'msg: Successfully enrolled admin user ' +
      appAdmin +
      ' and imported it into the wallet'
    );
  } catch ( e ) {
    console.log( e.stack );
  }
};

const regUser = async ( orgName, userName ) => {
  const ccpPath = path.join( __dirname, '..', 'config', orgName, 'connectionProfile.json' );
  const ccpJSON = fs.readFileSync( ccpPath, 'utf8' );
  const ccp = JSON.parse( ccpJSON );
  try {
    let appAdmin = 'admin';
    let orgMSPID = orgName + 'MSP';
    let gatewayDiscovery = {
      enabled: true,
      asLocalhost: false
    };
    const walletPath = path.join( __dirname, 'wallet', orgName );
    const wallet = new FileSystemWallet( walletPath );
    console.log( `Wallet path: ${ walletPath }` );
    const userExists = await wallet.exists( userName );
    if ( userExists ) {
      console.log(
        `An identity for the user ${ userName } already exists in the wallet`
      );
      return 'User already registered';
    }
    const adminExists = await wallet.exists( appAdmin );
    if ( !adminExists ) {
      console.log(
        `An identity for the admin user ${ appAdmin } does not exist in the wallet`
      );
      console.log( 'Registering the admin' );
      regAdmin( orgName );
    }
    const gateway = new Gateway();
    await gateway.connect( ccp, {
      wallet,
      identity: appAdmin,
      discovery: gatewayDiscovery
    } );
    const ca = gateway.getClient().getCertificateAuthority();
    const adminIdentity = gateway.getCurrentIdentity();
    const secret = await ca.register(
      {
        affiliation: 'org1',
        enrollmentID: userName,
        role: 'client'
      },
      adminIdentity
    );

    console.log( 'secret:' );
    console.log( secret );
    const enrollment = await ca.enroll( {
      enrollmentID: userName,
      enrollmentSecret: secret
    } );
    const userIdentity = X509WalletMixin.createIdentity(
      orgMSPID,
      enrollment.certificate,
      enrollment.key.toBytes()
    );
    wallet.import( userName, userIdentity );
    console.log(
      'Successfully registered and enrolled admin user ' +
      userName +
      ' and imported it into the wallet'
    );
    return {
      userName,
      secret
    }
  } catch ( e ) {
    console.log( 'Error Registering the user' + e.stack );
    return e
  }
};
// regUser('bayer', 'user2');

module.exports = regUser;