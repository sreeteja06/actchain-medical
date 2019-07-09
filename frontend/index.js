const express = require('express');
const hbs=require('hbs');
const axios = require('axios');
const util=require('util');
const path = require('path');

let app = express();

app.set('view engine', 'hbs');

//hbs.registerPartials(path.join(__dirname,'views/partials'));

app.use(express.static(path.join(__dirname, '/public')));

app.get('/suplied', function(req, res){
    // let response;
    // let id;
    // try {
    //  id = req.query.medid;
    
    //   response = await axios.get(
    //     `http://localhost:3000/getHistory?medicineId=${id}`,
    //   );
      
    //   res.render('transactions', { data: response.data ,id});
    // } catch (e) {
    //   console.log(e);
    //   res.sendStatus(500);
    // }
    res.render('suplied');
});

app.get('/manufacturer',function(req,res){
    res.render('manufacturer');
});

app.get('/create',function(req,res){
    res.render('create');
});

app.get('/createMed', async (req, res) => {
    let response;
    try {
      response = await axios.post(
        'http://localhost:3000/createMedicine',
        {
          medicineId: req.query.medid,
          name: req.query.medname,
          username: 'm001',
          expDate: req.query.exp,
          location: req.query.loc,
          extraConditionsName: '0',
          extraConditionsRequiredValue: '0',
          extraConditionsCondition: '0',
          orgName: 'manu'
        }
      );
      console.log(response.data);
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





app.listen(4000, ()=>{
    console.log(`****************** SERVER STARTED ************************
***************  Listening on: http://localhost:4000  ******************`)
})