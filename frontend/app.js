const express = require('express');
const hbs = require('hbs');
const axios = require('axios');
const util = require('util');
// const fs = require('fs')
const path = require('path');
let app = express();
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/manufacturer', function(req, res) {
  res.render('manufacturer');
});

app.get('/transactionid',function(req,res){
  res.render('transactionid');
});

app.get('/transactions', async function(req, res) {
  let response;
  let id;
  try {
   id = req.query.medid;
  
    response = await axios.get(
      `http://ec2-3-81-170-231.compute-1.amazonaws.com:3000/getHistory?medicineId=${id}`,
    );
    
    res.render('transactions', { data: response.data ,id});
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});



app.get('/pharmacy', function(req, res) {
  res.render('pharmacy');
});

app.get('/distro', async function(req, res) {
  let response;
  try{
    response = await axios.get(
      'http://ec2-3-81-170-231.compute-1.amazonaws.com:3000/getRequests?id=sree'
    );
    // console.log(response.data)
    for (var i = 0; i < response.data.length; i++) {
      if (response.data[i].Record.request != "true") {
        response.data.splice(i, 1);
      }
    }
    res.render('distributor', {data: JSON.parse(JSON.stringify(response.data))});
  }catch(e){
    console.log(e)
    res.send(500)
  }
});
// distributor
app.get('/manu-create', async (req, res) => {
  let response;
  try {
    response = await axios.post(
      'http://ec2-3-81-170-231.compute-1.amazonaws.com:3000/createMedicine',
      {
        medicineId: req.query.medicineId,
        name: req.query.name,
        username: 'sree',
        expDate: req.query.expiry,
        location: req.query.location,
        extraConditionsName: req.query.conditon_name,
        extraConditionsRequiredValue: req.query.conditionvalue,
        extraConditionsCondition: req.query.ConditionCondition,
        orgName: 'm-OUELIBUUXBGFJA3CKI5JE437PM'
      }
    );
    console.log(response.data);
    res.render('tx', { data: response.data });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.get('/sendMedicine', async (req, res) => {
  let response;
  try {
    response = await axios.post(
      'http://ec2-3-81-170-231.compute-1.amazonaws.com:3000/sendMedicine',
      {
        medicineId: req.query.medicineId,
        logistics: req.query.logistics,
        sendTo: req.query.sendTo
      }
    );
    res.render('tx', { data: response.data });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.get('/acceptRequest', async(req, res)=>{
  let response;
  try {
    response = await axios.post(
      'http://ec2-3-81-170-231.compute-1.amazonaws.com:3000/acceptRequest',
      {
        medicineId: req.query.medicineId,
        logisId: req.query.logisId,
        id: req.query.id
      }
    );
    res.render('tx', { data: response.data });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
})

app.get('/acceptMedicine', async (req, res) => {
  try {
    response = await axios.post(
      'http://ec2-3-81-170-231.compute-1.amazonaws.com:3000/acceptMedicine',
      {
        medicineId: req.query.medicineId,
        id: 'sree'
      }
    );
    res.render('tx', { data: response.data });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.get('/medicineInfo', (req, res) => {
  const medicineId = req.query.medicineId;
  res.send(res.query);
});

app.get('/track',async(req,res)=>{
  let response;
  let id;
  try {
   id = req.query.medid;
  
    response = await axios.get(
      `http://ec2-3-81-170-231.compute-1.amazonaws.com:3000/medicineInfo?medicineId=${id}`,
    );
    //console.log(response);
    res.render('track', { data: response.data ,id});
    //console.log(response);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log(`starting server`);
});

