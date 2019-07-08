const express = require('express');
const axios = require('axios');
const path = require('path');
let app = express();
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '/public')));
app.get('/', function(req, res){
    res.send('<h1>make this work man</h1>');
})

app.listen(4000, ()=>{
    console.log(`****************** SERVER STARTED ************************
***************  Listening on: http://localhost:4000  ******************`)
})