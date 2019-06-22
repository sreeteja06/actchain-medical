/* eslint-disable strict */
//'{"Args":["createMedicine","{"medicineId":"001","name":"critic","username":"mediTrack","expDate":"10/08/1998","location":"hyd","extraConditionsName":"temp","extraConditionsRequiredValue":"45","extraConditionsCondition":"lesser","orgName":"m-MCIZNCJNQRDKZPNRQ2AHBE7G6M"}"]}'

// eslint-disable-next-line no-unused-vars
let x = {
    medicineId: '001',
    name: 'critic',
    username: 'mediTrack',
    expDate: '10/08/1998',
    location: 'hyd',
    extraConditionsName: 'temp',
    extraConditionsRequiredValue: '45',
    extraConditionsCondition: 'lesser',
    orgName: 'm-MCIZNCJNQRDKZPNRQ2AHBE7G6M'
};

x = JSON.stringify(x);
console.log(x);