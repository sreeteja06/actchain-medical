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
var username = 'praneeth2';
var orgName = 'm-MCIZNCJNQRDKZPNRQ2AHBE7G6M';
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
app.get(
  '/health',
  awaitHandler(async (req, res) => {
    res.sendStatus(200);
  })
);

app.get(
  '/',
  awaitHandler(async (req, res) => {
    res.send(`
      <h1>actchain-medical api is still on its way, fueling up in the gachibowli fuel station</h1>
      `);
  })
);

// Register and enroll user. A user must be registered and enrolled before any queries
// or transactions can be invoked
app.post(
  '/users',
  awaitHandler(async (req, res) => {
    console.log('================ POST on Users');
    username = req.body.username;
    orgName = req.body.orgName;
    console.log('##### End point : /users');
    console.log('##### POST on Users- username : ' + username);
    console.log('##### POST on Users - userorg  : ' + orgName);
    let response = await connection.getRegisteredUser(username, orgName, true);
    console.log(
      '##### POST on Users - returned from registering the username %s for organization %s',
      username,
      orgName
    );
    console.log(
      '##### POST on Users - getRegisteredUser response secret %s',
      response.secret
    );
    console.log(
      '##### POST on Users - getRegisteredUser response secret %s',
      response.message
    );
    if (response && typeof response !== 'string') {
      console.log(
        '##### POST on Users - Successfully registered the username %s for organization %s',
        username,
        orgName
      );
      console.log(
        '##### POST on Users - getRegisteredUser response %s',
        response
      );
      // Now that we have a username & org, we can start the block listener
      await blockListener.startBlockListener(
        channelName,
        username,
        orgName,
        wss
      );
      res.json(response);
    } else {
      console.log(
        '##### POST on Users - Failed to register the username %s for organization %s with::%s',
        username,
        orgName,
        response
      );
      res.json({ success: false, message: response });
    }
  })
);

app.get(
  '/createMedicine',
  awaitHandler(async (req, res) => {
    let args = [];
    args.push(req.body.medicineId);
    args.push(req.body.name);
    args.push(req.body.username);
    args.push(req.body.expDate);
    args.push(req.body.location);
    args.push(req.body.extraConditionsName);
    args.push(req.body.extraConditionsRequiredValue);
    args.push(req.body.extraConditionsCondition);
    // args = ['002', 'hello', 'pee', '23-04-19', 'tel'];
    const fn = 'createMedicine';
    // let username = req.body.username;
    // let orgName = req.body.orgName;

    let message = await invoke.invokeChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);

app.get(
  '/medicineInfo',
  awaitHandler(async (req, res) => {
    let args = [];
    console.log('req Body of the request ' + JSON.stringify(req.body));
    args.push(req.body.medicineId);
    const fn = 'readMedicine';
    let message = await query.queryChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);

app.get(
  '/getMedicinesByOwner',
  awaitHandler(async (req, res) => {
    let args = [];
    console.log('req Body of the request ' + JSON.stringify(req.body));
    args.push(req.body.id);
    const fn = 'getMedicinesByOwner';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log(args);
    let message = await query.queryChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);

app.get(
  '/updateLocation',
  awaitHandler(async (req, res) => {
    let args = [];
    args.push(req.body.medicineId);
    args.push(req.body.location);
    const fn = 'updateLocation';
    // let username = req.body.username;
    // let orgName = req.body.orgName;

    let message = await invoke.invokeChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);
app.get(
  '/sendMedicine',
  awaitHandler(async (req, res) => {
    let args = [];
    args.push(req.body.medicineId);
    args.push(req.body.logistics);
    args.push(req.body.sendTo);
    const fn = 'sendMedicine';
    // let username = req.body.username;
    // let orgName = req.body.orgName;

    let message = await invoke.invokeChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);
app.get(
  '/getRecievedMedicines',
  awaitHandler(async (req, res) => {
    let args = [];
    console.log('req Body of the request ' + JSON.stringify(req.body));
    args.push(req.body.id);
    const fn = 'getRecievedMedicines';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log(args);
    let message = await query.queryChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);
app.get(
  '/acceptMedicine',
  awaitHandler(async (req, res) => {
    let args = [];
    args.push(req.body.medicineId);
    args.push(req.body.id);
    const fn = 'acceptMedicine';
    // let username = req.body.username;
    // let orgName = req.body.orgName;

    let message = await invoke.invokeChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);
app.get(
  '/sendRequest',
  awaitHandler(async (req, res) => {
    let args = [];
    args.push(req.body.medicineId);
    args.push(req.body.id);
    const fn = 'sendRequest';
    // let username = req.body.username;
    // let orgName = req.body.orgName;

    let message = await invoke.invokeChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);
app.get(
  '/getRequests',
  awaitHandler(async (req, res) => {
    let args = [];
    console.log('req Body of the request ' + JSON.stringify(req.body));
    args.push(req.body.id);
    const fn = 'getRequests';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log(args);
    let message = await query.queryChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);
app.get(
  '/getSentRequests',
  awaitHandler(async (req, res) => {
    let args = [];
    console.log('req Body of the request ' + JSON.stringify(req.body));
    args.push(req.body.id);
    const fn = 'getSentRequests';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log(args);
    let message = await query.queryChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);
app.get('/acceptRequest', awaitHandler(async (req, res) => {
  let args = [];
  args.push(req.body.medicineId);
  args.push(req.body.id);
  args.push(req.body.logisId);
  const fn = 'acceptRequest';
  // let username = req.body.username;
  // let orgName = req.body.orgName;

  let message = await invoke.invokeChaincode(
    peers,
    channelName,
    chaincodeName,
    args,
    fn,
    username,
    orgName
  );
  res.send(message);
}));
app.get('/addExtraCondition', awaitHandler(async (req, res) => {
  let args = [];
  args.push(req.body.medicineId);
  args.push(req.body.extraConditionName);
  args.push(req.body.extraConditionsRequiredValue);
  args.push(req.body.extraConditionsCondition);
  const fn = 'addExtraCondition';
  // let username = req.body.username;
  // let orgName = req.body.orgName;

  let message = await invoke.invokeChaincode(
    peers,
    channelName,
    chaincodeName,
    args,
    fn,
    username,
    orgName
  );
  res.send(message);
}));
app.get('/updateExtraCondition', awaitHandler(async (req, res) => {
  let args = [];
  args.push(req.body.medicineId);
  args.push(req.body.extraConditionName);
  args.push(req.body.extraConditionsUpdateValue);
  const fn = 'updateExtraCondition';
  // let username = req.body.username;
  // let orgName = req.body.orgName;

  let message = await invoke.invokeChaincode(
    peers,
    channelName,
    chaincodeName,
    args,
    fn,
    username,
    orgName
  );
  res.send(message);
}));
app.get(
  '/getChannelID',
  awaitHandler(async (req, res) => {
    let args = [];
    let fn = 'getChannelID';
    let message = await query.queryChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message.toString());
  })
);
app.get('/deleteMedicine', awaitHandler(async (req, res) => {
  let args = [];
  args.push(req.body.medicineId);
  const fn = 'deleteMedicine';
  // let username = req.body.username;
  // let orgName = req.body.orgName;

  let message = await invoke.invokeChaincode(
    peers,
    channelName,
    chaincodeName,
    args,
    fn,
    username,
    orgName
  );
  res.send(message);
}));

app.get('/getCreator', awaitHandler(async (req, res)=>{
  let args = [];
  console.log('req Body of the request ' + JSON.stringify(req.body));
  const fn = 'getCreator';
  // let username = req.body.username;
  // let orgName = req.body.orgName;
  console.log(args);
  let message = await query.queryChaincode(
    peers,
    channelName,
    chaincodeName,
    args,
    fn,
    username,
    orgName
  );
  res.send(message);
}))

app.get(
  '/getHistory',
  awaitHandler(async (req, res) => {
    let args = [];
    console.log('req Body of the request ' + JSON.stringify(req.body));
    args.push(req.body.medicineId);
    const fn = 'queryHistoryForKey';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log(args);
    let message = await query.queryChaincode(
      peers,
      channelName,
      chaincodeName,
      args,
      fn,
      username,
      orgName
    );
    res.send(message);
  })
);

app.use(function(error, req, res, next) {
  res.status(500).json({ error: error.toString() });
});
