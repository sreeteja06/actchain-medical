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

app.get('/distro', function(req, res) {
  res.render('distributor');
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

app.get('/acceptMedicine', (req, res) => {
  const medicineId = req.query.medicineId;
  const id = req.query.medicineId;
});

app.listen(3001, () => {
  console.log(`starting server`);
});
