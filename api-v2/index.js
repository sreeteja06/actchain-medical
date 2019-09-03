
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const cors = require( 'cors' );
var http = require( 'http' );

var regUser = require( './helpers/regUser' );
var query = require( './helpers/query' );
var invoke = require( './helpers/invoke' );
const {authenticate} = require('./middleware/authentication');

var host = 'localhost';
var username = ''//'M002';
var orgName = ''//'manu';
var channelName = 'meditrack';
var chaincodeName = 'test4';

let app = express();
app.options( '*', cors() );
app.use( cors() );
app.use( bodyParser.json() );
app.use(
  bodyParser.urlencoded( {
    extended: false
  } )
);
const port = process.env.PORT || 3000;

var server = http.createServer( app ).listen( port, function () { } );
console.log( '****************** SERVER STARTED ************************' );
console.log(
  '***************  Listening on: http://%s:%s  ******************',
  host,
  port
);
server.timeout = 240000;


app.use( function ( req, res, next ) {
  console.log( ' ##### New request for URL %s', req.originalUrl );
  return next();
} );

const awaitHandler = fn => {
  return async ( req, res, next ) => {
    try {
      await fn( req, res, next );
    } catch ( err ) {
      next( err );
    }
  };
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Health check - can be called by load balancer to check health of REST API
app.get(
  '/health',
  awaitHandler( async ( req, res ) => {
    res.sendStatus( 200 );
  } )
);

app.get(  '/',  awaitHandler( async ( req, res ) => {
    res.send( `
      <h1>actchain-medical api is still on its way, fueling up in the gachibowli fuel station</h1>
      `);
  } )
);

// Register and enroll user. A user must be registered and enrolled before any queries
// or transactions can be invoked
app.post(
  '/users',
  awaitHandler( async ( req, res ) => {
    console.log( '================ POST on Users' );
    username = req.body.username;
    orgName = req.body.orgName;
    console.log( '##### End point : /users' );
    console.log( '##### POST on Users- username : ' + username );
    console.log( '##### POST on Users - userorg  : ' + orgName );
    let response = await regUser( orgName, username );
    if ( response ) {
      // Now that we have a username & org, we can start the block listener
      res.send( response );
    } else {
      console.log(
        '##### POST on Users - Failed to register the username %s for organization %s with::%s',
        username,
        orgName,
        response
      );
      res.json( { success: false, message: response } );
    }
  } )
);

app.post(
  '/createMedicine', authenticate,
  awaitHandler( async ( req, res ) => {
    let args = [];
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    args.push( req.body.productID );
    args.push( req.body.name );
    args.push( req.username );
    args.push( req.body.expDate );
    args.push( req.body.location );
    args.push( req.body.extraConditionsName );
    args.push( req.body.extraConditionsRequiredValue );
    args.push( req.body.extraConditionsCondition );
    const fn = 'createMedicine';

    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send( message );
  } )
);

app.get(
  '/productInfo', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.query ) );
    args.push( req.query.productID );
    const fn = 'readProduct';
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message );
  } )
);

app.get(
  '/getProductByOwner', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.query ) );
    args.push( req.query.id );
    const fn = 'getProductByOwner';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log( args );
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message );
  } )
);



app.post(
  '/logisticsAcceptProduct', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.body ) );
    args.push( req.body.productID );
    args.push( req.body.logiId );
    const fn = 'logisticsAcceptProduct';
    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message );
  } )
);

app.post(
  '/manufacturerStock', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.body ) );
    args.push( req.body.productID );
    
    const fn = 'getMedicinesByHolderStock';
    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message );
  } )
);



app.post(
  '/updateLocation', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    args.push( req.body.productID );
    args.push( req.body.location );
    const fn = 'updateLocation';
    // let username = req.body.username;
    // let orgName = req.body.orgName;

    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send( message );
  } )
);
app.post(
  '/sendProduct', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    args.push( req.body.productID );
    args.push( req.body.logistics );
    args.push( req.body.sendTo );
    const fn = 'sendProduct';
    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send( message );
  } )
);
app.get(
  '/getRecievedProducts', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.query ) );
    args.push( req.query.id );
    const fn = 'getRecievedProduct';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log( args );
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    let filtered = []
    for( let i = 0; i < message.length ; i++){
      if(message[i].logistics != ""){
        filtered.push(message[i]);
      }
    }
    res.send( message );
  } )
);

app.get(
  '/getProductsByOwner', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.query ) );
    args.push( req.query.id );
    const fn = 'getProductsByOwner';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log( args );
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message );
  } )
);

app.post(
  '/acceptProduct', authenticate,
awaitHandler( async ( req, res ) => {
username = req.username;
orgName = req.body.orgName;
channelName = req.body.channelName;
chaincodeName = req.body.chaincodeName;
let args = [];
args.push( req.body.productID );
args.push( req.body.id );
const fn = 'acceptProduct';

let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

res.send( message );
} )
);
app.post(
  '/sendRequest', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    args.push( req.body.productID );
    args.push( req.body.id );
    const fn = 'sendRequest';
    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message );
  } )
);
app.get(
  '/logisticRecievingList', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.query ) );
    args.push( req.query.id );
    const fn = 'logisticRecievingList';
    console.log( args );
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message );
  } )
);

app.get(
  '/getRequests', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.query ) );
    args.push( req.query.id );
    const fn = 'getRequests';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log( args );
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message );
  } )
);
app.get(
  '/getSentRequests', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.query ) );
    args.push( req.query.id );
    const fn = 'getSentRequests';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log( args );
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message );
  } )
);

app.post(
  '/acceptRequest', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    args.push( req.body.productID );
    args.push( req.body.id );//pharmacy id
    args.push( req.body.logisId );
    const fn = 'acceptRequest';
    // let username = req.body.username;
    // let orgName = req.body.orgName;

    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send( message );
  } )
);

app.post(
  '/createPesticide', authenticate,
  awaitHandler(async (req, res) => {
    let args = [];
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    args.push(req.body.productID);
    args.push(req.body.name);
    args.push(req.username);
    args.push(req.body.expDate);
    args.push(req.body.location);
    args.push(req.body.extraConditionsName);
    args.push(req.body.extraConditionsRequiredValue);
    args.push(req.body.extraConditionsCondition);
    // args = ['002', 'hello', 'pee', '23-04-19', 'tel'];
    const fn = 'createPesticide';
    // let username = req.body.username;
    // let orgName = req.body.orgName;

    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send(message);
  })
);
app.get(
  '/getProductByHolder', authenticate,
  awaitHandler(async (req, res) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log('req query of the request ' + JSON.stringify(req.query));
    args.push(req.query.id);
    const fn = 'getProductByHolder';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log(args);
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    res.send(message);
  })
);

app.get(
  '/getProductByHolderStock', authenticate,
  awaitHandler(async (req, res) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log('req query of the request ' + JSON.stringify(req.query));
    args.push(req.query.id);
    const fn = 'getProductByHolderStock';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log(args);
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    res.send(message);
  })
);



app.get('/getPrivatePriceDetails',authenticate, awaitHandler(async (req, res)=>{
  username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log('req query of the request ' + JSON.stringify(req.query));
    args.push(req.query.productID);
    args.push(req.query.pdname);
    const fn = 'getPrivateProductPrice';
    console.log(args);
    let message = await query(
      fn, args, channelName, chaincodeName, orgName, username 
    );
    res.send(message);
  })
);
app.post(
  '/setPrivatePriceDetails/', authenticate,
  awaitHandler(async (req, res) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    args.push(req.body.productID);
    args.push(req.body.pdname);
    args.push(req.body.price);
    const fn = 'setPrivateProductPrice';
    // let username = req.body.username;
    // let orgName = req.body.orgName;

    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send(message);
  })
);

app.post(
  '/denyRequest', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    args.push( req.body.productID );
    args.push( req.body.distId );
    const fn = 'denyRequest';

    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send( message );
  } )
);

app.post(
  '/addExtraCondition', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    args.push( req.body.productID );
    args.push( req.body.extraConditionName );
    args.push( req.body.extraConditionsRequiredValue );
    args.push( req.body.extraConditionsCondition );
    const fn = 'addExtraCondition';

    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send( message );
  } )
);
app.post(
  '/updateExtraCondition', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    args.push( req.body.productID );
    args.push( req.body.extraConditionName );
    args.push( req.body.extraConditionsUpdateValue );
    const fn = 'updateExtraCondition';
    // let username = req.body.username;
    // let orgName = req.body.orgName;

    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send( message );
  } )
);
app.get(
  '/getChannelID', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    let fn = 'getChannelID';
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message.toString() );
  } )
);
app.delete(
  '/deleteProduct', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    args.push( req.body.productID );
    const fn = 'deleteProduct';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send( message );
  } )
);


app.get(
  '/getHistory', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.query ) );
    args.push( req.query.productID );
    const fn = 'queryHistoryForKey';
    console.log( args );
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    res.send( message );
  } )
);

app.get( '/getPriceDetails', authenticate, awaitHandler( async ( req, res ) => {
  username = req.username;
  orgName = req.query.orgName;
  channelName = req.query.channelName;
  chaincodeName = req.query.chaincodeName;
  let args = [];
  console.log( 'req query of the request ' + JSON.stringify( req.query ) );
  args.push( req.query.productID );
  args.push( req.query.pdname );
  const fn = 'getPrivateMedcinePrice';
  console.log( args );
  let message = await query( fn, args, channelName, chaincodeName, orgName, username );
  res.send( message );
} )
);

app.get( '/getProductAndHistory',
  awaitHandler( async ( req, res ) => {
    username = req.query.username;
    orgName = req.query.orgName;
    channelName = req.query.channelName;
    chaincodeName = req.query.chaincodeName;
    let args = [];
    console.log( 'req query of the request ' + JSON.stringify( req.query ) );
    args.push( req.query.id );
    let fn = 'getProductByHolder';
    // let username = req.body.username;
    // let orgName = req.body.orgName;
    console.log( args );
    let message = await query( fn, args, channelName, chaincodeName, orgName, username );
    message = JSON.parse( message );
    fn = 'queryHistoryForKey'
    let history, temp;
    for ( let i = 0; i < message.length; i++ ) {
      args = [];
      args.push( message[i].Key.toString() );
      history = await query( fn, args, channelName, chaincodeName, orgName, username );
      temp = message[i];
      temp.history = JSON.parse( history );
      message[i] = temp;
    }
    res.send( message );
  } ) );


app.post(
  '/setPriceDetails', authenticate,
  awaitHandler( async ( req, res ) => {
    username = req.username;
    orgName = req.body.orgName;
    channelName = req.body.channelName;
    chaincodeName = req.body.chaincodeName;
    let args = [];
    args.push( req.body.productID );
    args.push( req.body.pdname );
    args.push( req.body.price );
    const fn = 'setPrivateMedicinePrice';

    let message = await invoke( fn, args, channelName, chaincodeName, orgName, username );

    res.send( message );
  } )
);

app.use( function ( error, req, res, next ) {
  res.status( 500 ).json( { error: error.toString() } );
} );