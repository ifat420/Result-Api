const express = require('express');
const bodyParser = require('body-parser');
var oracledb = require('oracledb');
const db = require('./dbConnection/server');

//set up express
const app = express();


app.use(bodyParser.json());

app.use((req, res, next) => { 

    res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
 
     
    if (req.method == 'OPTIONS') {

        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
         
    }
    next();
  });

require('./startup/routes')(app);



app.listen(process.env.port || 4000, function(){
    console.log('now listening for request');
});