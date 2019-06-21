const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var hfc = require('fabric-client');
const uuidv4 = require('uuid/v4');
var http = require('http');
var util = require('util');
const WebSocketServer = require('ws');

var connection = require('./helpers/connection');
var query = require('./helpers/query');
var invoke = require('./helpers/invoke');
var blockListener = require('./helpers/blocklistener');

hfc.addConfigFile('./connection/config.json');
var host = 'localhost';
var username = '';
var orgName = '';
var channelName = hfc.getConfigSetting('channelName');
var chaincodeName = hfc.getConfigSetting('chaincodeName');
var peers = hfc.getConfigSetting('peers');

let app = express();
app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
); 
const port = process.env.PORT || 3000;

var server = http.createServer(app).listen(port, function() {});
console.log('****************** SERVER STARTED ************************');
console.log(
  '***************  Listening on: http://%s:%s  ******************',
  host,
  port
);
server.timeout = 240000;

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START WEBSOCKET SERVER ///////////////////////
///////////////////////////////////////////////////////////////////////////////
const wss = new WebSocketServer.Server({ server });
wss.on('connection', function connection(ws) {
  console.log(
    '****************** WEBSOCKET SERVER - received connection ************************'
  );
  ws.on('message', function incoming(message) {
    console.log('##### Websocket Server received message: %s', message);
  });

  ws.send('something');
});

app.use(function(req, res, next) {
  console.log(' ##### New request for URL %s', req.originalUrl);
  return next();
});

const awaitHandler = fn => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Health check - can be called by load balancer to check health of REST API
app.get('/health', awaitHandler(async (req, res) => {
	res.sendStatus(200);
}));

app.get('/', awaitHandler(async (req, res) => {
  res.send(`
      <h1>actchain-medical api is still on its way, fueling up in the gachibowli fuel station</h1>
      `);
}));

// Register and enroll user. A user must be registered and enrolled before any queries 
// or transactions can be invoked
app.post('/users', awaitHandler(async (req, res) => {
	logger.info('================ POST on Users');
	username = req.body.username;
	orgName = req.body.orgName;
	logger.info('##### End point : /users');
	logger.info('##### POST on Users- username : ' + username);
	logger.info('##### POST on Users - userorg  : ' + orgName);
	let response = await connection.getRegisteredUser(username, orgName, true);
	logger.info('##### POST on Users - returned from registering the username %s for organization %s', username, orgName);
    logger.info('##### POST on Users - getRegisteredUser response secret %s', response.secret);
    logger.info('##### POST on Users - getRegisteredUser response secret %s', response.message);
    if (response && typeof response !== 'string') {
        logger.info('##### POST on Users - Successfully registered the username %s for organization %s', username, orgName);
		logger.info('##### POST on Users - getRegisteredUser response %s', response);
		// Now that we have a username & org, we can start the block listener
		await blockListener.startBlockListener(channelName, username, orgName, wss);
		res.json(response);
	} else {
		logger.error('##### POST on Users - Failed to register the username %s for organization %s with::%s', username, orgName, response);
		res.json({success: false, message: response});
	}
}));

app.get('/createMedicine', awaitHandler(async (req, res) => {

  

  await contract.submitTransaction(
    'createMedicine',
    '001',
    'critic',
    'manu',
    '10/08/2019',
    'hyd',
    'temp',
    '45c',
    'lesser'
  );
  res.send('Transaction has been submitted');

  await gateway.disconnect();
}));
app.get('/readMedicine', awaitHandler(async (req, res) => {}));
app.get('/updateLocation', awaitHandler(async (req, res) => {}));
app.get('/sendMedicine', awaitHandler(async (req, res) => {}));
app.get('/getRecievedMedicines', awaitHandler(async (req, res) => {}));
app.get('/acceptMedicine', awaitHandler(async (req, res) => {}));
app.get('/sendRequest', awaitHandler(async (req, res) => {}));
app.get('/getRequests', awaitHandler(async (req, res) => {}));
app.get('/getSentRequests',awaitHandler(async(req, res)=>{}));
app.get('/acceptRequest', awaitHandler(async(req, res)=>{}));
app.get('/addExtraCondition', awaitHandler(async (req, res) => {}));
app.get('/updateExtraCondition', awaitHandler(async (req, res) => {}));
app.get('/getHistory', awaitHandler(async (req, res) => {}));
app.get('/deleteMedicine', awaitHandler(async (req, res) => {}));

app.use(function(error, req, res, next) {
  res.status(500).json({ error: error.toString() });
});
