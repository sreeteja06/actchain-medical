const express = require('express');
const hbs=require('hbs');
const axios = require('axios');
const util=require('util');
const path = require('path');

let app = express();
const URL = `ec2-user@ec2-18-219-122-111.us-east-2.compute.amazonaws.com`;
app.set('view engine', 'hbs');

//hbs.registerPartials(path.join(__dirname,'views/partials'));

app.use(express.static(path.join(__dirname, '/public')));


app.get('/suplied', async function(req, res){
   let response;
    try{
      response=await axios.get(`http://${URL}:3000/getProductsByOwner?username=${req.query.userName}&orgName=${req.query.orgName}&channelName=${req.query.channelName}&chaincodeName=${req.query.channelName}&id=${req.query.userName}` ) 
    }catch(e){
      console.log(e);
      res.sendStatus(500);
    }
    console.log(response);
    res.render('suplied',{data:response.data,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName,userName:req.query.userName,orgName:req.query.orgName});
  });


app.get('/manufacturer',async function(req,res){
    let response;
    // let chaincodename;
    // if(req.query.channel=="meditrack"){
    //   chaincodename='test4';
    // }else chaincodename='test4';
    try{
      response=await axios.get(`http://${URL}:3000/getProductsByOwner?username=mayerUser&orgName=mayer&channelName=ourchannel&chaincodeName=test4&id=mayerUser`);
      // { id:'mayerUser',
      //   username: 'mayerUser',
      //   orgName: 'mayer',
      //   channelName : 'ourchannel',
      //   chaincodeName: 'test4'
      // })
    }catch(e){
      console.log(e);
      res.sendStatus(500);
    }
    console.log(response);
    res.render('manufacturer',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode});
});

app.get('/manuFirst',async function(req,res){
  let response;
  try{
    response=await axios.get(`http://${URL}:3000/getRequests?id=mayerUser&username=mayerUser&orgName=mayer&channelName=ourchannel&chaincodeName=test4`)

  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
  console.log(response);
  
  res.render('requestFromDist',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode});
});
app.get('/create',function(req,res){
    res.render('create');
});
app.get('/historyindex',async function(req,res){
 
  res.render('historyindex');
});

app.get('/history',async function(req,res){
  let response;
   console.log(req.query.productID);
    try{
      response = await axios.get(`http://${URL}:3000/getHistory`,
      { productID:req.query.productID,
        username:req.query.userName,
        orgName:req.query.orgName,
        channelName:req.query.channelName,
        chaincodeName:req.query.chaincodeName
      });
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

app.get('/track',function(req,res){
  res.render('track');
});

app.get('/createMed', async (req, res) => {
    let response;
    try {
      response = await axios.post(
        `http://${URL}:3000/createMedicine`,
        {
          productID: req.query.productID,
          name: req.query.productName,
          username: 'M001',
          expDate: req.query.exp,
          location: req.query.loc,
          extraConditionsName: '0',
          extraConditionsRequiredValue: '0',
          extraConditionsCondition: '0',
          orgName: 'manu'
        }
      );
      
      res.render('tx', { data: response.data });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  });

 

app.get('/sendMed',async function(req,res){
    let response;
    try {
      response = await axios.post(
        `http://${URL}:3000/sendProduct`,
        
        { productID: req.query.productID, 
          logistics: req.query.logi,
          sendTo: req.query.sendto,
          username:req.query.userName,
          orgName:req.query.orgName,
          channelName:req.query.channelName,
          chaincodeName:req.query.chaincodeName
        }
      );
      res.render('tx', { data: response.data });
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
  Console.log(response.data);
  res.render('tx', { data: response.data });
});
//recieved 



// pharmacy

app.get('/pharMaStock',async function(req,res){
  let response;
  try{ response = await axios.get(`http://${URL}:3000/getProductsByHolder`,
  {      id:req.query.id,
        username: req.query.userName,
        orgName:req.query.orgName,
        channelName:req.query.channelName,
        chaincodeName:req.query.chaincodeName
  })

  }catch(e){console.log(e);res.sendStatus(500);}
  res.render('pharMaStock',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode});
});


app.get('/pharMarequested',async function(req,res){

  let response;
    try{
      response=await axios.get(`http://${URL}:3000/getSentRequests`,
      {  id:req.query.id,
        username:req.query.userName,
        orgName:req.query.orgName,
        channelName:req.query.channelName,
        chaincodeName:req.query.chaincodeName
      })
    }catch(e){
      console.log(e);
      res.sendStatus(500);
    }
    console.log(response.data);
    res.render('pharMarequested',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode});
});

app.get('/pharMarequest',async function(req,res){
    res.render('pharMarequest',{userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode});
});


//send Request

app.get('/sendReq',async function(req,res){
  let response;
    try {
      response = await axios.post(
        'http://${URL}:3000/sendRequest',
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
app.get('/recievingList', async function(req,res){
  let response;
  try{
    response = await axios.get(`http://${URL}:3000/logisticRecievingList`,
    { id: req.query.id,
      username:req.query.userName,
      orgName:req.query.orgName,
      channelName:req.query.channelName,
      chaincodeName:req.query.chaincodeName
    });
  }catch(err){
    console.log(err);
    res.sendStatus(500);
  }
  res.render('accept',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode});
});

app.get('/stock', async function(req,res){
  let response;
  try{
    response = await axios.get(`http://${URL}:3000/getProductsByHolder`,{
      id:req.query.userName,
      username:req.query.userName,
      orgName:req.query.orgName,
      channelName:req.query.channelName,
      chaincodeName:req.query.chaincodeName
    });
  }catch(err){
    console.log(err);
    res.sendStatus(500);
  }
  
  res.render('logiStock',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincodeName});
});




/////////////////////////////////distributor/////////////////////////////////////
app.get('/distributor', async function(req, res){
  let response;
   try{
     response=await axios.get(`http://${URL}:3000/getRecievedProducts?id=baiaUser&username=baiaUser&orgName=baia&channelName=ourchannel&chaincodeName=test4`,
      // {    id:req.query.userName,
      //      username:req.query.userName,
      //      orgName:req.query.orgName,
      //      channelName:req.query.channelName,
      //      chaincodeName:req.query.chaincodeName}
      ); }
      catch(e){
     console.log(e);
     res.sendStatus(500);
   }
  
   
   res.render('distributor',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode});
 });

 app.get('/stockdis', async function(req, res){
  let response;
   try{
     response=await axios.get(`http://${URL}:3000/getProductsByHolder`,
     { id :req.query.id,
      username:req.query.userName,
      orgName:req.query.orgName,
      channelName:req.query.channelName,
      chaincodeName:req.query.chaincodeName
    });
   }catch(e){
     console.log(e);
     res.sendStatus(500);
   } 
   console.log(response.data);
   res.render('stockdis',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode});
 });


app.get('/recieveFromManu', async function(req,res){
  let response;
  try{
    response =await axios.get(`http://${URL}:3000/getRecievedProducts?id=baiaUser&username=baiaUser&orgName=baia&channelName=ourchannel&chaincodeName=test4`,
   
    );
  }catch(e){console.log(e);
    res.sendStatus(500);
  }
  console.log(response.data);
  res.render('DistRecieveManu',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode})
});


app.get('/recieveToPharma', async function(req,res){
  let response;
  try{
    response =await axios.get(`http://${URL}:3000/getRecievedProducts?id=abolloUser`,
    {
      username:req.query.userName,
      orgName:req.query.orgName,
      channelName:req.query.channelName,
      chaincodeName:req.query.chaincodeName
    });
  }catch(e){console.log(e);
    res.sendStatus(500);
  }
  res.render('pharmaRecieve',{data:response.data,userName:req.query.userName,orgName:req.query.orgName,channelName:req.query.channelName,chaincodeName:req.query.chaincode})
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
  console.log("==========================================================================================================");
  console.
  try {
    response = await axios.post( `http://${URL}:3000/acceptProduct`,
      {
        productID: req.query.productID,
        id:req.query.userName,
        username:req.query.userName,
        orgName:req.query.orgName,
        channelName:req.query.channelName,
        chaincodeName:req.query.chaincodeName
      })
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
  
  res.render('tx', { data: response.data });
});


app.listen(4000, ()=>{
    console.log(`****************** SERVER STARTED ************************
***************  Listening on: http://${URL}:4000  ******************`)
});