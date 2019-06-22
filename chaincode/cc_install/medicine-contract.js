/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const shim = require('fabric-shim');
// eslint-disable-next-line no-unused-vars
const util = require('util');

// eslint-disable-next-line no-unused-vars

let MedicineContract = class {
    queryByString = async (stub, queryString) => {
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
                    jsonRes.Record = JSON.parse(
                        res.value.value.toString('utf8')
                    );
                } catch (err) {
                    console.log('##### queryByString error: ' + err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                await iterator.close();
                console.log(
                    '##### queryByString all results: ' +
                        JSON.stringify(allResults)
                );
                console.log('============= END : queryByString ===========');
                return Buffer.from(JSON.stringify(allResults));
            }
        }
    }

    async Init(stub) {
        console.info('=========== Instantiated fabcar chaincode ===========');
        return shim.success();
    }

    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];
        if (!method) {
            console.error('no function of name:' + ret.fcn + ' found');
            throw new Error(
                'Received unknown function ' + ret.fcn + ' invocation'
            );
        }
        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    async initLedger(stub, args) {
        console.log('============= START : Initialize Ledger ===========');
        console.log('============= END : Initialize Ledger ===========');
    }

    async medicineExists(stub, args) {
        // eslint-disable-next-line quotes
        console.log(`//////////////////////////////////////////////////////////////////////////////////////////////////////////////////n
        /////////////////////////////////////////////////////`+args);
        args = JSON.parse(args);
        const buffer = await stub.getState(args.medicineID.toString());
        console.log('TCL: medicineExists -> args.medicinID', args.medicineID);
        return !!buffer && buffer.length > 0;
    }
    //MedicineID - M_date_name_batch_box_serial
    /**
     *
     * @param {*} stub
     * @param {*} medicineId
     * @param {*} name
     * @param {*} owner
     * @param {*} expDate
     * @param {*} location
     * @param {*} extraConditionsName
     * @param {*} extraConditionsRequiredValue
     * @param {*} extraConditionsCondition
     */
    async createMedicine(stub, args) {
        args = JSON.parse(args);
        let medicine = {};
        medicine.docType = 'medicine';
        medicine.name = args.name;
        medicine.owner = args.owner;
        medicine.expDate = args.expDate;
        medicine.location = args.location;
        medicine.logistics = '';
        medicine.sendTo = '';
        medicine.extraConditions = {
            [args.extraConditionsName]: {
                required: args.extraConditionsRequiredValue,
                present: '',
                condition: args.extraConditionsCondition
            }
        };
        const buffer = Buffer.from(JSON.stringify(medicine));
        await stub.putState(args.medicineId.toString(), buffer);
    }

    async queryUsingCouchDB(stub, args) {
        args = JSON.parse(args);
        let result = await queryByString(stub, args.query);
        return result.toString();
    }

    async getMedicinesByOwner(stub, args) {
        args = JSON.parse(args);
        let result = await this.queryByString(
            stub,
            '{"selector":{"owner":{"$eq":"' + args.owner + '"}}}'
        );
        return result.toString();
    }

    async readMedicine(stub, args) {
        args = JSON.parse(args);
        const buffer = await stub.getState(args.medicineId.toString());
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    /**
     *
     * @param {*} stub - context
     * @param {number} medicineId
     * @param {} newLocation - {latitude, longitude}
     */

    async updateLocation(stub, args) {
        args = JSON.parse(args);
        const asset = await this.readMedicine(stub, args.medicineId.toString());
        asset.location = args.newLocation;
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args.medicineId.toString(), buffer);
    }
    /**
     *
     * @param {*} stub
     * @param {*} medicineId
     * @param {*} sendTo
     * @param {*} logiID
     */
    async sendMedicine(stub, args) {
        args = JSON.parse(args);
        const asset = await this.readMedicine(stub, args.medicineId.toString());
        asset.logistics = args.logiID;
        asset.sendTo = args.sendTo;
        // asset.owner = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args.medicineId.toString(), buffer);
    }

    async getRecievedMedicines(stub, args) {
        args = JSON.parse(args);
        let result = await this.queryByString(
            stub,
            '{"selector":{"sendTo":{"$eq":"' + args.id + '"}}}'
        );
        return result.toString();
    }

    async acceptMedicine(stub, args) {
        args = JSON.parse(args);
        const asset = await this.readMedicine(stub, args.medicineId.toString());
        asset.owner = asset.sendTo;
        asset.logistics = '';
        asset.sendTo = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args.medicineId.toString(), buffer);
    }

    /**
     *
     * @param {*} stub
     * @param {*} medicineId
     * @param {*} reuesterId
     */
    async sendRequest(stub, args) {
        args = JSON.parse(args);
        const asset = await this.readMedicine(stub, args.medicineId.toString());
        asset.requestId = args.reuesterId;
        asset.request = 'true';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args.medicineId.toString(), buffer);
    }

    async getRequests(stub, args) {
        args = JSON.parse(args);
        let result = await this.queryByString(
            stub,
            '{"selector":{"request":"true", "owner":"' + args.id + '"}}'
        );
        return result.toString();
    }

    async getSentRequests(stub, args) {
        args = JSON.parse(args);
        let result = await this.queryByString(
            stub,
            '{"selector":{"requestID":{"$eq":"' + args.id + '"}}}'
        );
        return result.toString();
    }

    /**
     *
     * @param {*} stub
     * @param {*} medicineId
     * @param {*} logiID
     */
    async acceptRequest(stub, args) {
        args = JSON.parse(args);
        const asset = await this.readMedicine(stub, args.medicineId.toString());
        asset.logistics = args.logiID;
        asset.sendTo = asset.requestId;
        asset.requestId = '';
        asset.request = '';
        // asset.owner = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args.medicineId.toString(), buffer);
    }

    /**
     *
     * @param {*} stub
     * @param {*} medicineId
     * @param {*} extraConditionsName
     * @param {*} extraConditionsRequiredValue
     * @param {*} extraConditionsCondition
     */
    async addExtraCondition(stub, args) {
        args = JSON.parse(args);
        const asset = await this.readMedicine(stub, args.medicineId.toString());
        asset.extraConditions[args.extraConditionsName] = {
            required: args.extraConditionsRequiredValue,
            present: '',
            condition: args.extraConditionsCondition
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args.medicineId.toString(), buffer);
    }

    /**
     *
     * @param {*} stub
     * @param {*} medicineId
     * @param {*} conditionName
     * @param {*} updateValue
     */
    async updateExtraCondition(stub, args) {
        args = JSON.parse(args);
        const asset = await this.readMedicine(stub, args.medicineId.toString());
        asset.extraConditions[args.conditionName].present = args.updateValue;
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(args.medicineId.toString(), buffer);
        if (asset.extraConditions.condition === 'greater') {
            if (
                asset.extraConditions[args.conditionName].present <=
                asset.extraConditions[args.conditionName].required
            ) {
                return JSON.parse('{condition: true}');
            } else {
                return JSON.parse('{condition: false}');
            }
        } else if (asset.extraConditions.condition === 'lesser') {
            if (
                asset.extraConditions[args.conditionName].present >=
                asset.extraConditions[args.conditionName].required
            ) {
                return JSON.parse('{condition: true}');
            } else {
                return JSON.parse('{condition: false}');
            }
        } else if (asset.extraConditions.condition === 'equal') {
            if (
                asset.extraConditions[args.conditionName].present ===
                asset.extraConditions[args.conditionName].required
            ) {
                return JSON.parse('{condition: true}');
            } else {
                return JSON.parse('{condition: false}');
            }
        }
    }

    async getHistory(stub, args) {
        args = JSON.parse(args);
        console.log(args.medicineId);
        let x = await stub.getHistoryForKey(args.medicineId.toString());
        console.log(x.response);
        return x.response;
    }

    async deleteMedicine(stub, args) {
        args = JSON.parse(args);
        await stub.deleteState(args.medicineId.toString());
    }

    async getTxID(stub) {
        let x = await stub.getTxID();
        console.log(x);
        return x;
    }

    async getStateValidationParameter(stub, args) {
        args = JSON.parse(args);
        let x = await stub.getStateValidationParameter(args.key);
        console.log(x);
        return x;
    }

    async getSignedProposal(stub) {
        let x = await stub.getSignedProposal();
        console.log(x);
        return x;
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

    async getBinding(stub) {
        let x = await stub.getBinding();
        console.log(x);
        return x;
    }
};

shim.start(new MedicineContract());
