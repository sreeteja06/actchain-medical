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
                '##### queryByString iterator: ' +
                    res.value.value.toString('utf8')
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
            throw new Error(
                'No chaincode function with name: ' + ret.fcn + ' found'
            );
        }
        try {
            let response = await method(stub, ret.params);
            console.log('##### Invoke response payload: ' + response);
            return shim.success(response);
        } catch (err) {
            console.log('##### Invoke - error: ' + err);
            return shim.error(err);
        }
    }
    async initLedger(stub, args) {
        console.log('============= START : Initialize Ledger ===========');
        console.log('============= END : Initialize Ledger ===========');
    }
    async createMedicine(stub, args) {
        try{
            console.log('============= START : createMedicine ===========');
            console.log(
                '##### createMedicine arguments: ' + JSON.stringify(args)
            );
            let medicine = {};
            medicine.docType = 'medicine';
            medicine.name = args[1];
            medicine.owner = args[2];
            medicine.expDate = args[3];
            medicine.location = args[4];
            medicine.logistics = '';
            medicine.sendTo = '';
            medicine.extraConditions = {
                [args[5]]: { //extraconditionname
                    required: args[6],//extraconditionrequiredvalue
                    present: '',
                    condition: args[7] //extra condition contdition
                }
            };
            const buffer = Buffer.from(JSON.stringify(medicine));
            await stub.putState(args[0].toString(), buffer);
        }catch(err){
            return shim.error(err)
        }
    }

    async queryUsingCouchDB(stub, args) {
        let json = JSON.parse(args);
        let result = await queryByString(stub, json.query.toString());
        return result.toString();
    }

    async getMedicinesByOwner(stub, args) {
        let result = await this.queryByString(
            stub,
            '{"selector":{"owner":{"$eq":"' + args[0] + '"}}}'      //owner
        );
        return result.toString();
    }

    async readMedicine(stub, args) {
        const buffer = await stub.getState(args[0].toString()); //medicineID
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateLocation(stub, args) {
        let json = JSON.parse(args);
        const asset = await this.readMedicine(stub, args[0].toString()); //medicineID
        asset.location = args[1];      //NEwLocation
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args[0].toString(), buffer);
    }

    async sendMedicine(stub, args) {
        let json = JSON.parse(args);
        const asset = await this.readMedicine(stub, args[0].toString());    //medicineID
        asset.logistics = args[1];      //logisticsID
        asset.sendTo = args[2];         //SendTo id
        // asset.owner = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(json.medicineId.toString(), buffer);
    }

    async getRecievedMedicines(stub, args) {
        let result = await this.queryByString(
            stub,
            '{"selector":{"sendTo":{"$eq":"' + args[0] + '"}}}' //id who eants to get the recieved medicines
        );
        return result.toString();
    }

    async acceptMedicine(stub, args) {
        const asset = await this.readMedicine(stub, args[0].toString());    //medicine id
        asset.owner = asset.sendTo;
        asset.logistics = '';
        asset.sendTo = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args[0].toString(), buffer);
    }

    async sendRequest(stub, args) {
        const asset = await this.readMedicine(stub, args[0].toString());  //medicineID
        asset.requestId = args[1];              //the id of who is sending the request
        asset.request = 'true';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args[0].toString(), buffer);
    }

    async getRequests(stub, args) {
        let result = await this.queryByString(
            stub,
            '{"selector":{"request":"true", "owner":"' + args[0] + '"}}'        //id of who needs to get the requests
        );
        return result.toString();
    }

    async getSentRequests(stub, args) {
        let result = await this.queryByString(
            stub,
            '{"selector":{"requestID":{"$eq":"' + args[0] + '"}}}'          //id of the person
        );
        return result.toString();
    }

    async acceptRequest(stub, args) {
        const asset = await this.readMedicine(stub, args[0].toString());        //medicineid
        asset.logistics = args[1];  //logistists id
        asset.sendTo = asset.requestId;
        asset.requestId = '';
        asset.request = '';
        // asset.owner = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args[0].toString(), buffer);
    }

    async addExtraCondition(stub, args) {
        const asset = await this.readMedicine(stub, args[0].toString());    //medicineID
        asset.extraConditions[args[1]] = {             //extra condition name
            required: args[2],                //extra condition required value
            present: '',
            condition: args[3]                    //ectra condtion condtion
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args[0].toString(), buffer);
    }

    async updateExtraCondition(stub, args) {
        const asset = await this.readMedicine(stub, args[0].toString());    //medicineID
        asset.extraConditions[args[1]].present = args[2];       // conditionname //update value
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

    async deleteMedicine(stub, args) {
        await stub.deleteState(args[0].toString()); //medicineID
    }

    async getChannelID(stub) {
        let x = await stub.getChannelID();
        console.log(x);
        return x;
    }

    async getCreator(stub) {
        let x = await stub.getCreator();
        console.log(x);
        return x;
    }

    async queryHistoryForKey(stub, args) {
        let historyIterator = await stub.getHistoryForKey(args[0]); //medicineID
        console.log(
            '##### queryHistoryForKey historyIterator: ' +
                util.inspect(historyIterator)
        );
        let history = [];
        while (true) {
            let historyRecord = await historyIterator.next();
            console.log(
                '##### queryHistoryForKey historyRecord: ' +
                    util.inspect(historyRecord)
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
                console.log(
                    '##### queryHistoryForKey json: ' + util.inspect(jsonRes)
                );
                history.push(jsonRes);
            }
            if (historyRecord.done) {
                await historyIterator.close();
                console.log(
                    '##### queryHistoryForKey all results: ' +
                        JSON.stringify(history)
                );
                console.log(
                    '============= END : queryHistoryForKey ==========='
                );
                return Buffer.from(JSON.stringify(history));
            }
        }
    }
};
shim.start(new Chaincode());