const express = require('express');
const hbs=require('hbs');
const axios = require('axios');
const util=require('util');
const path = require('path');

let app = express();

app.set('view engine', 'hbs');

//hbs.registerPartials(path.join(__dirname,'views/partials'));

app.use(express.static(path.join(__dirname, '/public')));


app.get('/suplied', async function(req, res){
   let response;
    try{
      response=await axios.get('http://localhost:3000/getMedicinesByOwner?id=M001')
    }catch(e){
      console.log(e);
      res.sendStatus(500);
    }
    console.log(response);
    res.render('suplied',{data:response.data});
  });


app.get('/manufacturer',async function(req,res){
    let response;
    try{
      response=await axios.get('http://localhost:3000/getMedicinesByOwner?id=M001')
    }catch(e){
      console.log(e);
      res.sendStatus(500);
    }
    console.log(response);
    res.render('manufacturer',{data:response.data});
});

app.get('/create',function(req,res){
    res.render('create');
});

app.get('/history',function(req,res){
  res.render('history');
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
        'http://localhost:3000/createMedicine',
        {
          medicineId: req.query.medid,
          name: req.query.medname,
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
        'http://localhost:3000/sendMedicine',
        {
          medicineId: req.query.medid,
          logistics: req.query.logi,
          sendTo: req.query.sendto
        }
      );
      res.render('tx', { data: response.data });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
});

// logistics

//recieved 



// pharmacy

app.get('/request',function(req,res){
  res.render('request');
});
;

app.get('/requested',async function(req,res){
  console.log('requested')
  let response;
    try{
      response=await axios.get('http://localhost:3000/getSentRequests?id=P001')
    }catch(e){
      console.log(e);
      res.sendStatus(500);
    }
    console.log(response.data);
    res.render('requested',{data:response.data});
});


//send Request

app.get('/sendReq',async function(req,res){
  let response;
    try {
      response = await axios.post(
        'http://localhost:3000/sendRequest',
        {
          medicineId: req.query.medid,
          id: 'P001',
        });
      res.render('tx', { data: response.data });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
});

//recieve list of logistics
app.get('/accept', async function(req,res){
  let response;
  try{
    response = await axios.get('http://localhost:3000/logisticRecievingList?id=l001');
  }catch(err){
    console.log(err);
    res.sendStatus(500);
  }
  console.log(response);
  
  res.render('accept',{data:response.data});
})
//distributor
app.get('/distributor', async function(req, res){
  let response;
   try{
     response=await axios.get('http://localhost:3000/getRequests?id=M002');
   }catch(e){
     console.log(e);
     res.sendStatus(500);
   }
   console.log(response);
   console.log(response.data);
   res.render('distributor',{data:response.data});
 });

app.get('/acceptReq',async function(req,res){
  let response;
  try{
    response=await axios.post('http://localhost:3000/acceptRequest',
    {
      medicineId: req.query.medicineId,
	    id: req.query.id,
	    logisId: 'l001',
    });
    res.render('tx', { data: response.data });
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
});

app.listen(4000, ()=>{
    console.log(`****************** SERVER STARTED ************************
***************  Listening on: http://localhost:4000  ******************`)
});