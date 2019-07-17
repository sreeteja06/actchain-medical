/*
 *     _____________  ___  
      / ___/ ___/ _ \/ _ \ 
     (__  ) /  /  __/  __/ 
    /____/_/   \___/\___  
 * File Created: Tuesday, 16th July 2019 10:50:39 am
 * Author: SreeTeja06 (sreeteja.muthyala@gmail.com)

 * There are two ways to write error-free programs; only the third one works.
 * And remeber it is not a bug, it is an undocumented feature
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');

let app = express();
app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

const port = process.env.PORT || 3001;


var server = http.createServer(app).listen(port, function() {});
console.log('****************** SERVER STARTED ************************');
console.log(
  '***************  Listening on: http://%s  ******************',
  port
);
server.timeout = 240000;