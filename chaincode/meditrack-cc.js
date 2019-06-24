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
        let medicine = {};
        medicine.docType = 'medicine';
        medicine.name = 'critic';
        medicine.owner = 'activa';
        medicine.expDate = '10/08/1998';
        medicine.location = 'hyd';
        medicine.logistics = '';
        medicine.sendTo = '';
        medicine.extraConditions = {
            temp: {
                required: '45',
                present: '',
                condition: 'lesser'
            }
        };
        const buffer = Buffer.from(JSON.stringify(medicine));
        await stub.putState('001', buffer);
        console.log('============= END : Initialize Ledger ===========');
    }
    async createMedicine(stub, args) {
        try{
            console.log('============= START : createMedicine ===========');
            console.log(
                '##### createMedicine arguments: ' + JSON.stringify(args)
            );

            // args is passed as a JSON string
            // let json = JSON.parse(args);
            let medicine = {};
            medicine.docType = 'medicine';
            medicine.name = args[1];
            medicine.owner = args[2];
            medicine.expDate = args[3];
            medicine.location = args[4];
            medicine.logistics = '';
            medicine.sendTo = '';
            // medicine.extraConditions = {
            //     [json.extraConditionsName]: {
            //         required: json.extraConditionsRequiredValue,
            //         present: '',
            //         condition: json.extraConditionsCondition
            //     }
            // };
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
        let json = JSON.parse(args);
        let result = await this.queryByString(
            stub,
            '{"selector":{"owner":{"$eq":"' + json.owner + '"}}}'
        );
        return result.toString();
    }

    async readMedicine(stub, args) {
        let json = JSON.parse(args);
        const buffer = await stub.getState(json.medicineId.toString());
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateLocation(stub, args) {
        let json = JSON.parse(args);
        const asset = await this.readMedicine(stub, json.medicineId.toString());
        asset.location = json.newLocation;
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(json.medicineId.toString(), buffer);
    }

    async sendMedicine(stub, args) {
        let json = JSON.parse(args);
        const asset = await this.readMedicine(stub, json.medicineId.toString());
        asset.logistics = json.logiID;
        asset.sendTo = json.sendTo;
        // asset.owner = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(json.medicineId.toString(), buffer);
    }

    async getRecievedMedicines(stub, args) {
        let json = JSON.parse(args);
        let result = await this.queryByString(
            stub,
            '{"selector":{"sendTo":{"$eq":"' + json.id + '"}}}'
        );
        return result.toString();
    }

    async acceptMedicine(stub, args) {
        let json = JSON.parse(args);
        const asset = await this.readMedicine(stub, json.medicineId.toString());
        asset.owner = asset.sendTo;
        asset.logistics = '';
        asset.sendTo = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(json.medicineId.toString(), buffer);
    }

    async sendRequest(stub, args) {
        let json = JSON.parse(args);
        const asset = await this.readMedicine(stub, json.medicineId.toString());
        asset.requestId = json.reuesterId;
        asset.request = 'true';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(json.medicineId.toString(), buffer);
    }

    async getRequests(stub, args) {
        let json = JSON.parse(args);
        let result = await this.queryByString(
            stub,
            '{"selector":{"request":"true", "owner":"' + json.id + '"}}'
        );
        return result.toString();
    }

    async getSentRequests(stub, args) {
        let json = JSON.parse(args);
        let result = await this.queryByString(
            stub,
            '{"selector":{"requestID":{"$eq":"' + json.id + '"}}}'
        );
        return result.toString();
    }

    async acceptRequest(stub, args) {
        let json = JSON.parse(args);
        const asset = await this.readMedicine(stub, json.medicineId.toString());
        asset.logistics = json.logiID;
        asset.sendTo = asset.requestId;
        asset.requestId = '';
        asset.request = '';
        // asset.owner = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(json.medicineId.toString(), buffer);
    }

    async addExtraCondition(stub, args) {
        let json = JSON.parse(args);
        const asset = await this.readMedicine(stub, json.medicineId.toString());
        asset.extraConditions[json.extraConditionsName] = {
            required: json.extraConditionsRequiredValue,
            present: '',
            condition: json.extraConditionsCondition
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(json.medicineId.toString(), buffer);
    }

    async updateExtraCondition(stub, args) {
        let json = JSON.parse(args);
        const asset = await this.readMedicine(stub, json.medicineId.toString());
        asset.extraConditions[json.conditionName].present = json.updateValue;
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(json.medicineId.toString(), buffer);
        if (asset.extraConditions.condition === 'greater') {
            if (
                asset.extraConditions[json.conditionName].present <=
                asset.extraConditions[json.conditionName].required
            ) {
                return JSON.parse('{condition: true}');
            } else {
                return JSON.parse('{condition: false}');
            }
        } else if (asset.extraConditions.condition === 'lesser') {
            if (
                asset.extraConditions[json.conditionName].present >=
                asset.extraConditions[json.conditionName].required
            ) {
                return JSON.parse('{condition: true}');
            } else {
                return JSON.parse('{condition: false}');
            }
        } else if (asset.extraConditions.condition === 'equal') {
            if (
                asset.extraConditions[json.conditionName].present ===
                asset.extraConditions[json.conditionName].required
            ) {
                return JSON.parse('{condition: true}');
            } else {
                return JSON.parse('{condition: false}');
            }
        }
    }

    async deleteMedicine(stub, args) {
        let json = JSON.parse(args);
        await stub.deleteState(json.medicineId.toString());
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
        console.log('============= START : queryHistoryForKey ===========');
        console.log(
            '##### queryHistoryForKey arguments: ' + JSON.stringify(args)
        );

        // args is passed as a JSON string
        let json = JSON.parse(args);
        let key = json['key'];
        console.log('##### queryHistoryForKey key: ' + key);
        let historyIterator = await stub.getHistoryForKey(key);
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
