const express = require('express');
const hbs=require('hbs');
const axios = require('axios');
const util=require('util');
const path = require('path');

let app = express();
const URL = `localhost`; 
app.set('view engine', 'hbs');

//hbs.registerPartials(path.join(__dirname,'views/partials'));

app.use(express.static(path.join(__dirname, '/public')));


app.get('/suplied', async function(req, res){
      let response;
        try{
          response=await axios.get(`http://${URL}:3000/getProductByOwner?id=${req.query.userName}&username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.chaincodeName}` ) 
        }catch(e){
          console.log(e);
          res.sendStatus(500);
        }
        console.log(response);
        res.render('suplied',{data:response.data,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName,userName:req.query.userName,orgName:req.query.orgName});
  });

  
app.get('/manufacturer',async function(req,res){
        let response;
        try{
          response=await axios.get(`http://${URL}:3000/getProductByHolderStock?id=${req.query.userName}&username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.chaincodeName}` ) 
        }catch(e){
          console.log(e);
          res.sendStatus(500);
        }
        console.log(response);
        res.render('manufacturer',{data:response.data,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName,userName:req.query.userName,orgName:req.query.orgName});
});

app.get('/manuFirst',async function(req,res){
        let response;
        try{
          response=await axios.get(`http://${URL}:3000/getRequests?id=${req.query.userName}&username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.chaincodeName}`);
        }catch(e){
          console.log(e);
          res.sendStatus(500);
        }
        console.log(response);
        res.render('requestFromDist',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
});

app.get('/create',async function(req,res){
        res.render('create');
});

app.get('/historyindex',async function(req,res){
        res.render('historyindex',{userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
});

app.get('/trackindex',async function(req,res){
  res.render('trackindex',{userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
});
app.get('/history',async function(req,res){
        let response;
        console.log(req.query);
          try{
            response = await axios.get(`http://${URL}:3000/getHistory?productID=${req.query.productID}&username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.chaincodeName}`);
          }catch(e){
            console.log(e);
            res.sendStatus(500);
          }
          console.log(response);
          res.render('history',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode} );
  });
  

app.get('/',function(req,res){
          res.render('login');
});

app.get('/track',async function(req,res){
          let response;
          let productID = req.query.productID
          try{
              response = await axios.get(
                `http://${URL}:3000/productInfo?productID=${
                  req.query.productID
                }&username=${req.query.userName}&orgName=${
                  req.query.orgName
                }&channelName=${
                  req.query.channelName
                }&chaincodeName=${req.query.chaincodeName}`
              );
            }catch(e){
              console.log(e);
              res.sendStatus(500);
            }
            console.log(response.data);
            let arr =[] ;
            let obj = {
              key: 'Manufacturer',
              value: response.data.owner
            };
            arr.push(obj);
            if (response.data.checkLogiD) {
              obj = {
                key: 'Distributor logistics',
                value: response.data.checkLogiD
              };
              arr.push(obj);
            }
            if(response.data.checkDist){
              obj = {
                key: 'Distributor',
                value: response.data.checkDist
              };
              arr.push(obj);
            }
            if(response.data.checkLogiP){
              obj = {
                key: 'Pharmacy logistics',
                value: response.data.checkLogiP
              };
              arr.push(obj);
            }
            if(response.data.checkPharma){
              obj = {
                key: 'Pharmacy',
                value: response.data.checkPharma
              };
              arr.push(obj);
            }
          res.render('track',{
            data: arr, productID
        });
});

app.get('/createMed', async (req, res) => {
    let response;
    try {
      response = await axios.post(
        `http://${URL}:3000/createMedicine`,
        {
          productID: req.query.productID,
          name: req.query.productName,
          username: req.query.userName,
          expDate: req.query.exp,
          location: req.query.loc,
          extraConditionsName: '0',
          extraConditionsRequiredValue: '0',
          extraConditionsCondition: '0',
          orgName: req.query.orgName,
          channelName:req.query.channelName,
          chaincodeName:req.query.chaincodeName
        }
      );
      console.log(response.data)
      res.render('tx', { data: response.data});
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  });

 

app.get('/sendMed',async function(req,res){
    let response;
    console.log(req.query);
    try {
      response = await axios.post( `http://${URL}:3000/sendProduct`,    
        { productID: req.query.medid, 
          logistics: req.query.logi,
          sendTo: req.query.sendto,
          username:req.query.userName,
          orgName:req.query.orgName,
          channelName:req.query.channelName,
          chaincodeName:req.query.chaincodeName
        }
      );
      console.log(response.data);
      res.render('tx', { data: response.data});
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
});

// logistics
app.get('/acceptRes',async function(req,res){
  let response;
  console.log("==========================================================================================================")
  try {
    response = await axios.post( `http://${URL}:3000/logisticsAcceptProduct`,
      {
        productID: req.query.medid,
        logiId: req.query.logiId,
        username:req.query.userName,
        orgName:req.query.orgName,
        channelName:req.query.channelName,
        chaincodeName:req.query.chaincodeName,
        
      }
 ); 
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
  console.log(response.data);
  res.render('tx', { data: response.data });
});

// pharmacy

app.get('/pharMaStock',async function(req,res){
          let response;
          console.log(req.query);
          try{ response = await axios.get(`http://${URL}:3000/getProductByHolder?id=${req.query.userName}&username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.chaincodeName}`);
        }catch(e){
          console.log(e);
          res.sendStatus(500);
        }
          res.render('pharMaStock',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
});


app.get('/pharMarequested',async function(req,res){

      let response;
        try{
          response=await axios.get(`http://${URL}:3000/getSentRequests?id=${req.query.userName}&username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.chaincodeName}`,
          )
        }catch(e){
          console.log(e);
          res.sendStatus(500);
        }
        console.log(response.data);
        res.render('pharMarequested',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
});

app.get('/pharMarequest',async function(req,res){
        console.log(req.query);
        res.render('pharMarequest',{userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
});


//send Request

app.get('/sendReq',async function(req,res){
        let response;
        console
          try {
            response = await axios.post(
              `http://${URL}:3000/sendRequest`,
              {
                productID: req.query.productID,
                id:req.query.userName,
                username:req.query.userName,
                orgName:req.query.orgName,
                channelName:req.query.channelName,
                chaincodeName:req.query.chaincodeName
                
              });
             res.render('tx', { data: response.data });
               } catch (e) {
                console.log(e);
                res.sendStatus(500);
    }
});
//////////////////////////////////logistics///////////////////////////////////////////////
//logisticseve list of logistics
app.get('/recievingList',async function(req,res){
        let response;
          try {
            response = await axios.get(
              `http://${URL}:3000/logisticRecievingList?id=${req.query.userName}&username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.chaincodeName}`
              );
            } catch (e) {
            console.log(e);
            res.sendStatus(500);
          }
          console.log(response.data);
          res.render('accept',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});

});

app.get('/stock', async function(req,res){
          let response;
          try{
            response=await axios.get(`http://${URL}:3000/getProductByHolder?id=${req.query.userName}&username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.chaincodeName}`,
            );
          }catch(e){
            console.log(e);
            res.sendStatus(500);
          } 
          console.log(response.data);
          res.render('logiStock',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
 });




/////////////////////////////////distributor/////////////////////////////////////
app.get('/distributor', async function(req, res){
        let response;
        console.log(req.query);
        try{
          response=await axios.get(`http://${URL}:3000/getRequests?id=${req.query.userName}&username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.chaincodeName}`
          ); }
            catch(e){
          console.log(e);
          res.sendStatus(500);
        }
        console.log(response.data);
        
        res.render('distributor',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
 });

app.get('/distreq',function(req,res){
        res.render('distrequest',{userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
})

app.get('/stockdis', async function(req, res){
        let response;
        try{
          response=await axios.get(`http://${URL}:3000/getProductByHolder?id=${req.query.userName}&username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.chaincodeName}`,
          );
        }catch(e){
          console.log(e);
          res.sendStatus(500);
        } 
        res.render('stockdis',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
        });


app.get('/recieveFromManu', async function(req,res){
        let response;
        try{
        response = await axios.get(
          `http://${URL}:3000/getRecievedProducts?id=${
            req.query.userName
          }&username=${req.query.userName}&orgName=${
            req.query.orgName
          }&channelName=${req.query.channelName}&chaincodeName=${
            req.query.chaincodeName
          }`
        );
        }catch(e){console.log(e);
          res.sendStatus(500);
        }
        console.log(response.data);
        res.render('DistRecieveManu',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName})
});


app.get('/recieveToPharma', async function(req,res){
        let response;
        try{
          response = await axios.get(
            `http://${URL}:3000/getRecievedProducts?id=${
              req.query.userName
            }&username=${req.query.userName}&orgName=${
              req.query.orgName
            }&channelName=${req.query.channelName}&chaincodeName=${
              req.query.chaincodeName
            }`
          );
        }catch(e){console.log(e);
          res.sendStatus(500);
        }
        res.render('pharmaRecive',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName})
});

app.get('/acceptReq', async function(req,res){
        let response;
        try{
          response=await axios.post(`http://${URL}:3000/acceptRequest`,
          {
            productID: req.query.productID,
            id: req.query.id,
            logisId: req.query.logi,
            username:req.query.userName,
            orgName:req.query.orgName,
            channelName:req.query.channelName,
            chaincodeName:req.query.chaincodeName
          });
          res.render('tx', { data: response.data });
        }catch(e){
          console.log(e);
          res.sendStatus(500);
        }
});
 
app.get('/acceptResFinal',async function(req,res){
  let response;
          try{
            response = await axios.post( `http://${URL}:3000/acceptProduct`,
                {
                  productID:req.query.productID,
                  id:req.query.userName,
                  username:req.query.userName,
                  orgName:req.query.orgName,
                  channelName: req.query.channelName,
                  chaincodeName:req.query.chaincodeName
                })}
              catch(e){
                console.log(e);
                res.sendStatus(500);
              }
          console.log(response.data);
          res.render('tx', { data: response.data })}
);

////////////////////////inspector/////////////////////////////////////////////
app.get('/cdscoManu',async function(req,res){
  let response;
  try{
    response = await axios.get(
      `http://${URL}:3000/getProductByOwner?id=mayerUser&username=mayerUser&orgName=mayer&channelName=${
        req.query.channelName
      }&chaincodeName=${req.query.chaincodeName}`
    ); 
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
  console.log(response);
  res.render('cdscoManu',{data:response.data,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName,userName:req.query.userName,orgName:req.query.orgName});
});

app.listen(4000, ()=>{
    console.log(`****************** SERVER STARTED ************************
***************  Listening on: http://${URL}:4000  ******************`)
});