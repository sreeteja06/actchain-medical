const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

let app = express();
app.use(cors());
app.use(bodyParser.json());
const port = process.env.PORT || 1337;

app.get("/", (req, res) => {
    res.send(`
      <h1>actchain-medical api is still on its way, fueling up in the gachibowli fuel station</h1>
      `);
});


app.get("/manu-admin-creation-wallet", async (req, res) => {
    const ccpPath = path.resolve(__dirname, 'local_fabric_connection.json'); //change this to match the appropriate connection profile
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(ccpJSON);
    try {
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`wallet path: ${walletPath}`);
        const adminExists = await wallet.exists('admin');
        if (adminExists) {
            res.send("an identity for the admin already exists");
            return;
        }
        const enrollment = await ca.enroll({ enrollmentID: 'manu-admin', enrollmentSecret: 'admind1', role: 'client' });
        const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import('manu-admin', identity);
        res.send("successfully enrolled the manuAdmin and imported into the wallet")
    } catch (error) {
        res.send(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
});
app.get("/createMedicine", async (req, res) => {
        const ccpPath = path.resolve(__dirname, 'local_fabric_connection.json');
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(ccpJSON);

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const userExists = await wallet.exists('admin');

        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            res.send('Run the registerUser.js application before retrying');
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin'});

        const network = await gateway.getNetwork('mychannel');

        const contract = network.getContract('actchain-medical@0.0.1');

        await contract.submitTransaction('createMedicine', "001", "critic", "manu", "10/08/2019", "hyd", "temp", "45c", "lesser");
        res.send('Transaction has been submitted');

        await gateway.disconnect();

})
app.listen(port, () => {
    console.log(`Started up at port http://localhost:${port}/`);
});