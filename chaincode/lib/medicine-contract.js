/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

// eslint-disable-next-line no-unused-vars
async function queryByString(ctx, queryString) {
    console.log('============= START : queryByString ===========');
    console.log('##### queryByString queryString: ' + queryString);

    // CouchDB Query
    let iterator = await ctx.stub.getQueryResult(queryString);
    let allResults = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        let res = await iterator.next();

        if (res.value && res.value.value.toString()) {
            let jsonRes = {};
            console.log('##### queryByString iterator: ' + res.value.value.toString('utf8'));

            jsonRes.Key = res.value.key;
            try {
                jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
            }
            catch (err) {
                console.log('##### queryByString error: ' + err);
                jsonRes.Record = res.value.value.toString('utf8');
            }
            allResults.push(jsonRes);
        }
        if (res.done) {
            await iterator.close();
            console.log('##### queryByString all results: ' + JSON.stringify(allResults));
            console.log('============= END : queryByString ===========');
            return Buffer.from(JSON.stringify(allResults));
        }
    }
}

class MedicineContract extends Contract {
    async medicineExists(ctx, medicineId) {
        const buffer = await ctx.stub.getState(medicineId);
        return !!buffer && buffer.length > 0;
    }
    //MedicineID - M_date_name_batch_box_serial
    async createMedicine(
        ctx,
        medicineId,
        name,
        owner,
        expDate,
        location,
        extraConditionsName,
        extraConditionsRequiredValue,
        extraConditionsCondition
    ) {
        const exists = await this.medicineExists(ctx, medicineId);
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
        await ctx.stub.putState(medicineId, buffer);
    }

    async queryUsingCouchDB(ctx, query) {
        let result = await queryByString(ctx, query);
        return result.toString();
    }

    async getMedicinesByOwner(ctx, owner){
        let result = await queryByString(
            ctx,
            '{"selector":{"owner":{"$eq":"'+owner+'"}}}'
        );
        return result.toString();
    }

    async readMedicine(ctx, medicineId) {
        const exists = await this.medicineExists(ctx, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const buffer = await ctx.stub.getState(medicineId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    /**
     *
     * @param {*} ctx - context
     * @param {number} medicineId
     * @param {} newLocation - {latitude, longitude}
     */

    async updateLocation(ctx, medicineId, newLocation) {
        const exists = await this.medicineExists(ctx, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const asset = await this.readMedicine(ctx, medicineId);
        asset.location = newLocation;
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(medicineId, buffer);
    }

    async sendMedicine(ctx, medicineId, sendTo, logiID){
        const exists = await this.medicineExists(ctx, medicineId);
        if (!exists) {
            throw new Error(
                `The medicine ${medicineId} does not exist`
            );
        }
        const asset = await this.readMedicine(ctx, medicineId);
        asset.logistics = logiID;
        asset.sendTo = sendTo;
        asset.owner = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(medicineId, buffer);
    }

    async acceptMedicine(ctx, medicineId){
        const exists = await this.medicineExists(ctx, medicineId);
        if (!exists) {
            throw new Error(
                `The medicine ${medicineId} does not exist`
            );
        }
        const asset = await this.readMedicine(ctx, medicineId);
        asset.owner = asset.sendTo;
        asset.logistics = '';
        asset.sendTo = '';
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(medicineId, buffer);
    }

    async addExtraCondition(
        ctx,
        medicineId,
        extraConditionsName,
        extraConditionsRequiredValue,
        extraConditionsCondition
    ) {
        const exists = await this.medicineExists(ctx, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const asset = await this.readMedicine(ctx, medicineId);
        asset.extraConditions[extraConditionsName] = {
            required: extraConditionsRequiredValue,
            present: '',
            condition: extraConditionsCondition
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(medicineId, buffer);
    }

    async updateExtraCondition(ctx, medicineId, conditionName, updateValue) {
        const exists = await this.medicineExists(ctx, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        const asset = await this.readMedicine(ctx, medicineId);
        asset.extraConditions[conditionName].present = updateValue;
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(medicineId, buffer);
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

    async getHistory(ctx, medicineId) {
        console.log(medicineId);
        let x = await ctx.stub.getHistoryForKey(medicineId);
        console.log(x.response);
        return x.response;
    }

    async deleteMedicine(ctx, medicineId) {
        const exists = await this.medicineExists(ctx, medicineId);
        if (!exists) {
            throw new Error(`The medicine ${medicineId} does not exist`);
        }
        await ctx.stub.deleteState(medicineId);
    }

    async getTxID(ctx) {
        let x = await ctx.stub.getTxID();
        console.log(x);
        return x;
    }

    async getStateValidationParameter(ctx, key) {
        let x = await ctx.stub.getStateValidationParameter(key);
        console.log(x);
        return x;
    }

    async getSignedProposal(ctx) {
        let x = await ctx.stub.getSignedProposal();
        console.log(x);
        return x;
    }

    async getChannelID(ctx) {
        let x = await ctx.stub.getChannelID();
        console.log(x);
        return x;
    }

    async getCreator(ctx) {
        let x = await ctx.stub.getCreator();
        console.log(x);
        return x;
    }

    async getBinding(ctx) {
        let x = await ctx.stub.getBinding();
        console.log(x);
        return x;
    }
}

module.exports = MedicineContract;
