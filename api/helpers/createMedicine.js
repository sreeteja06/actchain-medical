const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

let main = async () => {
    const ccpPath = path.resolve(__dirname, '..', 'local_fabric_connection.json');
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(ccpJSON);

    const walletPath = path.join(__dirname, '..', 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    const userExists = await wallet.exists('admin');

    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }

    let connectionOptions = {
        identity: 'admin',
        wallet: wallet,
        discovery: { enabled:false, asLocalhost: true }
    };

    const gateway = new Gateway();
    // await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });
    await gateway.connect(ccp, connectionOptions);
    
    const network = await gateway.getNetwork('mychannel');

    const contract = network.getContract('actchain-medical@0.0.1');

    await contract.submitTransaction('createMedicine', "001", "critic", "manu", "10/08/2019", "hyd", "temp", "45c", "lesser");
    console.log('Transaction has been submitted');

    await gateway.disconnect();
}

main();