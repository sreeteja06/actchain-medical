'user strict'
const shim = require('fabric-shim');
const util=require('util');

async function queryByKey(stub,key){
  console.log("=======Start=======");
  console.log("##########query by key##########+"+key+"");
  let carAsBytes = await stub.getState(key);
  if(!carAsBytes || carAsBytes.toString().length()){
      console.log("error");
      throw new Error('key'+key+'dosent exist');
      
  }
console.log("value for key"+carAsBytes);
return carAsBytes;
}
async function queryByString(stub,queryString){


    console.log("query by string");
    let jsonQueryString = JSON.parse(queryString);
    let iterator = await stub.getStateByRange("","");
    let allresults=[];
    while(true){
     
      let res = await iterator.next();
      if(res.value && res.value.value.toString()){
       let jsonres={};
       console.log("query iterator"+res.value.value.toString());
       jsonres.key = res.value.key;
       try{
           jsonres.record = JSON.parse(res.value.value.toString('utf8'));      
       }catch(err){
           console.log(err);
           jsonres.record = res.value.value.toString('utf8');
       }

       let jsonRecord = jsonQueryString['selector'];
      if(Object.keys(jsonRecord)==1){
          allresults.push(jsonres);
          continue;
      }
      for(var key in jsonRecord){
          if(key == 'docType'){
              continue;
          }
          console.log("query iterator has key "+jsonres.Record[key]);
          if(!(jsonres.record[key]) && jsonres.record[key]==jsonRecord[key]){
              continue;
          }
          allresults.push(jsonres);
      }

      }
      if(res.done){
        await iterator.close();
        console.log("query by string all results"+JSON.stringify(allresults));
        return Buffer.from(JSON.stringify(allresults));

    }
    
    }
}




let chaincode = class{
    async Init(stub){
        console.log('======================instantiated-----------');
        return shim.success();
   }
 async initledger(stub){
     console.log("+++++++++++++initialize ledger++++++++++++");
     
 }
  async Invoke(stub){
      console.log("invoking");
      let ret = await stub.getFunctionAndParameters();
      console.log("function and args"+JSON.stringify(ret));
      let method = this[ret.fcn];
      if(!method){
          console.log("function is not availabe");
          throw new Error("function not found");
      }
      try{
          let Response = await method(stub,ret.params);
          console.log("invoke response payload"+response);
          return shim.success(response);
        }catch(err){
          console.log("error incoking the function");
          shim.Error(err);
         }
    }

  async createMedicine(stub,args){
      try{console.log("Start:create medicine");
      console.log("create medicine with params"+JSON.stringify(args));
      let medicine={};
      medicine.docType='medicine';
      medicine.name=args[1];
      medicine.owner =args[2];
      maedicine.expDate=args[3];
      medicine.location=args[4];
      medicine.logistics='';
      medicine.sendTo='';
      medicine.extraConditons={
          [args[5]]:{
              required:args[6],
              present='',
              condition:args[7]
          }
      };
      const buffer = Buffer.from(JSON.stringify(medicine));
      await stub.putstate(args[0].toString(),buffer);

  }catch(err){
      
      return shim.Error(err);
  }
 }

 async queryUsingCouchDB(stub,args){
     let json= JSON.parse(args);
     return await queryByString(stub,json.query.toString());
 }
 async getMedicinesByOwner(stub,args){
     let queryString = '{"selector":{"docType":"medicine","owner":"'+args[0]+'"}}';
     return await queryByString(stub,queryByString);
 }
 async readMedicineByOwner(stub,args){
     return queryByKey(stub,args[0].toString);
 }
 async updateLocation(stub,args){
    let asset = await stub.queryByKey(stub,args[0].toString());
    asset = JSON.parse(asset.toString());
    asset.location=args[1];
    const buffer= Buffer.from(JSON.stringify(asset));
    await stub.putState(args[0].toString(),buffer);

 }
 async sendMedicine(stub,args){
     let asset = await queryByKey(stub,args[0].toString());
     asset=JSON.parse(asset.toString());
     asset.logistics=args[1];
     asset.sendTo=args[2];
     const buffer= Buffer.from(JSON.stringify(asset));
     await stub.putState(args[0].toString(),buffer);
 }
 async getRecievedMedicines(stub,args){
     let queryString='{"selector":{"docType":"medicine","sendTo":"'+args[0].toString()+'"}';
     return await queryByString(stub,queryString);
 }
 async accceptMedicine(stub,args){
     let assset =await stub.queryByKey(stub,args[0].toString());
     asset = JSON.parse(asset.toString());
     asset.requestId=args[1];
     asset.request='true';
     const buffer = Buffer.from(JSON.stringify(asset));
     await stub.putState(args[0].toString(), buffer);
 }
 async getRequests(stub,args){
     let queryString = '{"Selector":{"dockType":"medicine","owner":"'+args[0].toString()+'"}';
     return await queryByString(stub,queryString);
    }

async getSentRequests(stub,args){
    let queryString ='{"Selector":{"docType":"medicine","requestId":"'+args[0].toString()+'"}}';
    return await queryByString(stub,queryString);
}
async acceptRequests(stub,args){
  let asset = await queryByKey(stub,args[0].toString());
  asset = JSON.parse(asset.toString());
  asset.sendTo=asset.requestId;
  asset.requestId='';
  asset.request='';
  asset.logistics=args[2];
  const buffer = Buffer.from(JSON.stringify(asset));
  await stub.putState(args[0].toString(), buffer);
}
async deleteMedicine(stub,args){
    await stub.deleteState(args[0].toString());
}
async getChannelId(stub,args){
            let x = await this.getChannelId();
            console.log(x);
            return Buffer.from(x.toString());
}
async getCreator(stub,args){
    let x = await this.getCreator();
            console.log(x);
            return Buffer.from(x.toString());
}
}