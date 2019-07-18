'use strict';
const shim = require('fabric-shim');
const util = require('util');

async function queryByKey(stub, key) {
  console.log('============= START : queryByKey ===========');
  console.log('##### queryByKey key: ' + key);

  let resultAsBytes = await stub.getState(key);
  if (!resultAsBytes || resultAsBytes.toString().length <= 0) {
    throw new Error('##### queryByKey key: ' + key + ' does not exist');
  }
  console.log('##### queryByKey response: ' + resultAsBytes);
  console.log('============= END : queryByKey ===========');
  return resultAsBytes;
}

async function queryByString(stub, queryString) {
  console.log('============= START : queryByString ===========');
  console.log('##### queryByString queryString: ' + queryString);

  // CouchDB Query
  let iterator = await stub.getQueryResult(queryString);
  let allResults = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let res = await iterator.next();

    if (res.value && res.value.value.toString()) {
      let jsonRes = {};
      console.log(
        '##### queryByString iterator: ' + res.value.value.toString('utf8')
      );

      jsonRes.Key = res.value.key;
      try {
        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
      } catch (err) {
        console.log('##### queryByString error: ' + err);
        jsonRes.Record = res.value.value.toString('utf8');
      }
      allResults.push(jsonRes);
    }
    if (res.done) {
      await iterator.close();
      console.log(
        '##### queryByString all results: ' + JSON.stringify(allResults)
      );
      console.log('============= END : queryByString ===========');
      return Buffer.from(JSON.stringify(allResults));
    }
  }
}

/************************************************************************************************
 *
 * CHAINCODE
 *
 ************************************************************************************************/

let Chaincode = class {
  async Init(stub) {
    console.log(
      '=========== Init: Instantiated / Upgraded ngo chaincode ==========='
    );
    return shim.success();
  }
  async Invoke(stub) {
    console.log('============= START : Invoke ===========');
    let ret = stub.getFunctionAndParameters();
    console.log('##### Invoke args: ' + JSON.stringify(ret));

    let method = this[ret.fcn];
    if (!method) {
      console.error(
        '##### Invoke - error: no chaincode function with name: ' +
          ret.fcn +
          ' found'
      );
      throw new Error('No chaincode function with name: ' + ret.fcn + ' found');
    }
    try {
      let response = await method(stub, ret.params);
      console.log('##### Invoke response payload: ' + response);
      return shim.success(response);
    } catch (err) {
      console.log('##### Invoke - error: ' + err.stack);
      return shim.error(err);
    }
  }
  async initLedger(stub, args) {
    console.log('============= START : Initialize Ledger ===========');
    console.log('============= END : Initialize Ledger ===========');
  }
  async createPesticide(stub, args) {        //TODO: add attributes into Pesticide to support track page
    try {
      args = JSON.parse(args);
      console.log('============= START : createPesticide ===========');
      console.log('##### createPesticide arguments: ' + JSON.stringify(args));
      let pesticide = {};
      pesticide.docType = 'pesticide';
      pesticide.name = args[1];
      pesticide.holder = args[2];
      pesticide.owner = args[2];
      pesticide.expDate = args[3];
      pesticide.location = args[4];
      pesticide.logistics = '';
      pesticide.requestLogistics = '';
      pesticide.sendTo = '';
      pesticide.checkLogiD='';
      pesticide.checkDist='';
      pesticide.checkLogiP='';
      pesticide.checkPharma='';
      pesticide.extraConditions = {
        [args[5]]: {
          //extraconditionname
          required: args[6], //extraconditionrequiredvalue
          present: '',
          condition: args[7] //extra condition contdition
        }
      };
      console.log(pesticide);
      const buffer = Buffer.from(JSON.stringify(pesticide));
      await stub.putState(args[0].toString(), buffer);
    } catch (err) {
      return shim.error(err);
    }
  }
  async logisticRecievingList(stub,args){
    args = JSON.parse(args);
    let queryString = '{"selector":{"requestLogistics":"' + args[0] + '"}}}'; //*logistics id
    return await queryByString(
      stub,
      queryString
    );
    
    
  }

  async getPesticidesByOwner(stub, args) {
    args = JSON.parse(args);
    let queryString = '{"selector":{"owner":{"$eq":"' + args[0] + '"}}}'; //*manufacture id
    return await queryByString(
      stub,
      queryString
    );
  }
  

  async getPesticidesByHolder(stub, args) {
    args = JSON.parse(args);
    let queryString = '{"selector":{"holder":"' + args[0] + '"}}}'; //*holder
    return await queryByString(
      stub,
      queryString
    );
  }

  async readPesticide(stub, args) {
    args = JSON.parse(args);
    //pesticideID
    return queryByKey(stub, args[0].toString());
  }

  async updateLocation(stub, args) {
    args = JSON.parse(args);
    let asset = await queryByKey(stub, args[0].toString()); //*pesticideID
    asset = JSON.parse(asset.toString());
    asset.location = args[1]; //*NEwLocation
    const buffer = Buffer.from(JSON.stringify(asset));
    await stub.putState(args[0].toString(), buffer);
  }

  async sendPesticide(stub, args) {
    args = JSON.parse(args);
    let asset = await queryByKey(stub, args[0].toString()); //*pesticideID
    asset = JSON.parse(asset.toString());
    asset.requestLogistics = args[1]; //*logisticsID
    asset.sendTo = args[2]; //*SendTo id - distrubuter id if sending to dist or pharmacy id if sending to phar
    const buffer = Buffer.from(JSON.stringify(asset));
    await stub.putState(args[0].toString(), buffer);
  }

  async logisticsAcceptPesticide(stub, args){
    args = JSON.parse(args);
    let asset = await queryByKey(stub, args[0].toString()); //*pesticideID
    asset = JSON.parse(asset.toString());
    if (args[1].toString() == asset.requestLogistics.toString()) {  //*logistics Id
      asset.holder=asset.requestLogistics;
      asset.logistics = asset.requestLogistics;
      asset.requestLogistics = '';
      // let check=asset.sendTo;
      // if(check.includes('D')){
      //   pesticide.checkLogiD=asset.logistics;
      // }
      // else if(check.includes('P')){
      //   pesticide.checkLogiP=asset.logistics;
      // }
    }
    const buffer = Buffer.from(JSON.stringify(asset));
    await stub.putState(args[0].toString(), buffer);
  }

  async getRecievedPesticides(stub, args) {
    args = JSON.parse(args);
    let queryString = '{"selector":{"sendTo":{"$eq":"' + args[0] + '"}}}';  //*send to id, dist id for distrubutor, phar id for pharmacy
    return await queryByString(
      stub,
      queryString //id who eants to get the recieved pesticides
    );
  }

  async acceptPesticide(stub, args) {
    args = JSON.parse(args);
    let asset = await queryByKey(stub, args[0].toString()); //*pesticide id
    asset = JSON.parse(asset.toString());
    if (args[1].toString() == asset.sendTo.toString()) {//*dist id or phar id
      //id of who accepts the pesticides
      asset.holder = asset.sendTo;
      asset.logistics = '';
      asset.requestLogistics = '';
      asset.sendTo = '';
    }
    const buffer = Buffer.from(JSON.stringify(asset));
    await stub.putState(args[0].toString(), buffer);
  }

  async sendRequest(stub, args) {
    args = JSON.parse(args);
    let asset = await queryByKey(stub, args[0].toString()); //*pesticideID
    asset = JSON.parse(asset.toString());
    asset.requestId = args[1]; //*phar ID
    asset.request = 'true';
    const buffer = Buffer.from(JSON.stringify(asset));
    await stub.putState(args[0].toString(), buffer);
  }

  async getRequests(stub, args) {
    args = JSON.parse(args);
    let queryString =
      '{"selector":{"request":"true", "holder":"' + args[0] + '"}}';  //*dist ID
    return await queryByString(
      stub,
      queryString //id of who needs to get the requests
    );
  }

  async getSentRequests(stub, args) {
    args = JSON.parse(args);
    let queryString = '{"selector":{"requestId":{"$eq":"' + args[0] + '"}}}'; //*phar ID
    return await queryByString(
      stub,
      queryString //id of the person
    );
  }
  
 async recieveFromManu(stub,args){
   args = JSON.parse(args);
  let queryString = '{"selector":{"sendTo":"' + args[0] + '"}}}';  //*phar id or dist id
  return await queryByString(stub,queryString);
 }
  async acceptRequest(stub, args) {
    let asset = await queryByKey(stub, args[0].toString()); //*pesticideid
    asset = JSON.parse(asset.toString());
    
      //id
      asset.requestLogistics = args[2]; //*logistists id
      asset.sendTo = asset.requestId;
      asset.requestId = '';
      asset.request = '';
    
    // asset.owner = '';
    const buffer = Buffer.from(JSON.stringify(asset));
    await stub.putState(args[0].toString(), buffer);
  }

  async denyRequest(stub ,args){
    args = JSON.parse(args);
    let asset = await queryByKey(stub, args[0].toString()); //*pesticideid
    if (args[1].toString() == asset.holder.toString()) { //*dist ID
      asset.requestId = '';
      asset.request = '';
      const buffer = Buffer.from(JSON.stringify(asset));
      await stub.putState(args[0].toString(), buffer);
    }
  }

  async addExtraCondition(stub, args) {
    args = JSON.parse(args);
    let asset = await queryByKey(stub, args[0].toString()); //*pesticideID
    asset = JSON.parse(asset.toString());
    asset.extraConditions[args[1]] = {
      //extra condition name
      required: args[2], //extra condition required value
      present: '',
      condition: args[3] //ectra condtion condtion
    };
    const buffer = Buffer.from(JSON.stringify(asset));
    await stub.putState(args[0].toString(), buffer);
  }

  async updateExtraCondition(stub, args) {
    args = JSON.parse(args);
    let asset = await queryByKey(stub, args[0].toString()); //pesticideID
    asset = JSON.parse(asset.toString());
    asset.extraConditions[args[1]].present = args[2]; // conditionname //update value
    const buffer = Buffer.from(JSON.stringify(asset));
    await stub.putState(args[0].toString(), buffer);
    if (asset.extraConditions.condition === 'greater') {
      if (
        asset.extraConditions[args[1]].present <= //condition name
        asset.extraConditions[args[1]].required
      ) {
        return JSON.parse('{condition: true}');
      } else {
        return JSON.parse('{condition: false}');
      }
    } else if (asset.extraConditions.condition === 'lesser') {
      if (
        asset.extraConditions[args[1]].present >=
        asset.extraConditions[args[1]].required
      ) {
        return JSON.parse('{condition: true}');
      } else {
        return JSON.parse('{condition: false}');
      }
    } else if (asset.extraConditions.condition === 'equal') {
      if (
        asset.extraConditions[args[1]].present ===
        asset.extraConditions[args[1]].required
      ) {
        return JSON.parse('{condition: true}');
      } else {
        return JSON.parse('{condition: false}');
      }
    }
  }

  async deletePesticide(stub, args) {
    args = JSON.parse(args);
    await stub.deleteState(args[0].toString()); //pesticideID
  }

  async getChannelID(stub) {
    let x = await stub.getChannelID();
    console.log(x);
    return Buffer.from(x.toString());
  }

  async getCreator(stub) {
    let x = await stub.getCreator();
    console.log(x);
    return Buffer.from(x.toString());
  }

  async queryHistoryForKey(stub, args) {
    args = JSON.parse(args);
    let historyIterator = await stub.getHistoryForKey(args[0]); //pesticideID
    console.log(
      '##### queryHistoryForKey historyIterator: ' +
        util.inspect(historyIterator)
    );
    let history = [];
    while (true) {
      let historyRecord = await historyIterator.next();
      console.log(
        '##### queryHistoryForKey historyRecord: ' + util.inspect(historyRecord)
      );
      if (historyRecord.value && historyRecord.value.value.toString()) {
        let jsonRes = {};
        console.log(
          '##### queryHistoryForKey historyRecord.value.value: ' +
            historyRecord.value.value.toString('utf8')
        );
        jsonRes.TxId = historyRecord.value.tx_id;
        jsonRes.Timestamp = historyRecord.value.timestamp;
        jsonRes.IsDelete = historyRecord.value.is_delete.toString();
        try {
          jsonRes.Record = JSON.parse(
            historyRecord.value.value.toString('utf8')
          );
        } catch (err) {
          console.log('##### queryHistoryForKey error: ' + err);
          jsonRes.Record = historyRecord.value.value.toString('utf8');
        }
        console.log('##### queryHistoryForKey json: ' + util.inspect(jsonRes));
        history.push(jsonRes);
      }
      if (historyRecord.done) {
        await historyIterator.close();
        console.log(
          '##### queryHistoryForKey all results: ' + JSON.stringify(history)
        );
        console.log('============= END : queryHistoryForKey ===========');
        return Buffer.from(JSON.stringify(history));
      }
    }
  }

  async setPrivatePesticidePrice(stub, args){
    args = JSON.parse(args);
    let price = {
      price: args[2]
    }
    const buffer = Buffer.from(JSON.stringify(price));
    await stub.getPrivateData(args[1], args[0]);
    await stub.putPrivateData(args[1], args[0], buffer);
  }

  async getPrivatePesticidePrice(stub, args){
    args = JSON.parse(args);
    return await stub.getPrivateData(args[1], args[0]);
  }

};
shim.start(new Chaincode());


