/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const shim = require('fabric-shim');
// eslint-disable-next-line no-unused-vars
const util = require('util');

// eslint-disable-next-line no-unused-vars


let MedicineContract = class {
    async queryByString(stub, queryString) {
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

    async medicineExists(stub, medicineId) {
        const buffer = await stub.getState(medicineId);
        return !!buffer && buffer.length > 0;
    }
    //MedicineID - M_date_name_batch_box_serial
    async createMedicine(
        stub,
        medicineId,
        name,
        owner,
        expDate,
        location,
        extraConditionsName,
        extraConditionsRequiredValue,
        extraConditionsCondition
    ) {
        const exists = await this.medicineExists(stub, medicineId);
        if (exists) {
            throw new Error(`The medicine ${medicineId} already exists`);
        }
        let medicine = {};
        medicine.docType = 'medicine';
        medicine.name = name;
        medicine.owner = owner;
        medicine.expDate = expDate;
        medicine.location = location;
        medicine.logistics = '';
        medicine.sendTo = '';
        medicine.extraConditions = {
            [extraConditionsName]: {
                required: extraConditionsRequiredValue,
                present: '',
                condition: extraConditionsCondition
            }
        };
        const buffer = Buffer.from(JSON.stringify(medicine));
        await stub.putState(medicineId, buffer);
    }

    async queryUsingCouchDB(stub, query) {
        let result = await this.queryByString(stub, query);
        return result.toString();
    }

    async getMedicinesByOwner(stub, owner) {
        let result = await this.queryByString(
            stub,
            '{"selector":{"owner":{"$eq":"' + owner + '"}}}'
        );
        return result.toString();
    }

    async readMedicine(stub, medicineId) {
        const exists = await this.medicineExists(stub, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const buffer = await stub.getState(medicineId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    /**
     *
     * @param {*} stub - context
     * @param {number} medicineId
     * @param {} newLocation - {latitude, longitude}
     */

    async updateLocation(stub, medicineId, newLocation) {
        const exists = await this.medicineExists(stub, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const asset = await this.readMedicine(stub, medicineId);
        asset.location = newLocation;
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(medicineId, buffer);
    }

    async sendMedicine(stub, medicineId, sendTo, logiID) {
        const exists = await this.medicineExists(stub, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const asset = await this.readMedicine(stub, medicineId);
        asset.logistics = logiID;
        asset.sendTo = sendTo;
        asset.owner = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(medicineId, buffer);
    }

    async getRecievedMedicines(stub, id) {
        let result = await this.queryByString(
            stub,
            '{"selector":{"sendTo":{"$eq":"' + id + '"}}}'
        );
        return result.toString();
    }

    async acceptMedicine(stub, medicineId) {
        const exists = await this.medicineExists(stub, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const asset = await this.readMedicine(stub, medicineId);
        asset.owner = asset.sendTo;
        asset.logistics = '';
        asset.sendTo = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(medicineId, buffer);
    }

    async sendRequest(stub, medicineId, reuesterId) {
        const exists = await this.medicineExists(stub, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const asset = await this.readMedicine(stub, medicineId);
        asset.requestId = reuesterId;
        asset.request = 'true';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(medicineId, buffer);
    }

    async getRequests(stub, id) {
        let result = await this.queryByString(
            stub,
            '{"selector":{"request":"true", "owner":"' + id + '"}}'
        );
        return result.toString();
    }

    async getSentRequests(stub, id) {
        let result = await this.queryByString(
            stub,
            '{"selector":{"requestID":{"$eq":"' + id + '"}}}'
        );
        return result.toString();
    }

    async acceptRequest(stub, medicineId, logiID) {
        const exists = await this.medicineExists(stub, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const asset = await this.readMedicine(stub, medicineId);
        asset.logistics = logiID;
        asset.sendTo = asset.requestId;
        asset.requestId = '';
        asset.request = '';
        asset.owner = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(medicineId, buffer);
    }

    async addExtraCondition(
        stub,
        medicineId,
        extraConditionsName,
        extraConditionsRequiredValue,
        extraConditionsCondition
    ) {
        const exists = await this.medicineExists(stub, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const asset = await this.readMedicine(stub, medicineId);
        asset.extraConditions[extraConditionsName] = {
            required: extraConditionsRequiredValue,
            present: '',
            condition: extraConditionsCondition
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(medicineId, buffer);
    }

    async updateExtraCondition(stub, medicineId, conditionName, updateValue) {
        const exists = await this.medicineExists(stub, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const asset = await this.readMedicine(stub, medicineId);
        asset.extraConditions[conditionName].present = updateValue;
        const buffer = Buffer.from(JSON.stringify(asset));
        await stub.putState(medicineId, buffer);
        if (asset.extraConditions.condition === 'greater') {
            if (
                asset.extraConditions[conditionName].present <=
                asset.extraConditions[conditionName].required
            ) {
                return JSON.parse('{condition: true}');
            } else {
                return JSON.parse('{condition: false}');
            }
        } else if (asset.extraConditions.condition === 'lesser') {
            if (
                asset.extraConditions[conditionName].present >=
                asset.extraConditions[conditionName].required
            ) {
                return JSON.parse('{condition: true}');
            } else {
                return JSON.parse('{condition: false}');
            }
        } else if (asset.extraConditions.condition === 'equal') {
            if (
                asset.extraConditions[conditionName].present ===
                asset.extraConditions[conditionName].required
            ) {
                return JSON.parse('{condition: true}');
            } else {
                return JSON.parse('{condition: false}');
            }
        }
    }

    async getHistory(stub, medicineId) {
        console.log(medicineId);
        let x = await stub.getHistoryForKey(medicineId);
        console.log(x.response);
        return x.response;
    }

    async deleteMedicine(stub, medicineId) {
        const exists = await this.medicineExists(stub, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        await stub.deleteState(medicineId);
    }

    async getTxID(stub) {
        let x = await stub.getTxID();
        console.log(x);
        return x;
    }

    async getStateValidationParameter(stub, key) {
        let x = await stub.getStateValidationParameter(key);
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
