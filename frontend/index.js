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

app.get('/accept', function(req,res){
  // let response;
  // try{
  //   response=await axios.get('http://localhost:3000/getMedicinesByOwner?id=M001')
  // }catch(e){
  //   console.log(e);
  //   res.sendStatus(500);
  // }
  // console.log(response);
  res.render('accept',/*{data:response.data}*/);
});


app.listen(4000, ()=>{
    console.log(`****************** SERVER STARTED ************************
***************  Listening on: http://localhost:4000  ******************`)
})