/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
var generator = require('generate-password');
var bcrypt = require('bcrypt');
var fse = require('fs-extra');

const router = express.Router();


oracledb.autoCommit = true;

// insert Session Admin
 
router.post('/insert/sessionAdmin', function(req, res, next){ 
    var uDet = {}
    var resultArray = req.body; 
   
    oracledb.getConnection(dbConfig, function(err, connection){
        var obj = req.body;
        var userID = [];
        
        var userPwd = [];
       
        var sesId = [];
       
        var adCat = []; 
        
        
  
        obj.forEach(el => {
            let unm = `${el.deptAbbr}-${el.sesDes}`;
            userID.push(unm);
            sesId.push(el.sesId.toString());
            adCat.push(parseFloat(3));
            let password = generator.generate({
              length: 6,
              numbers: true
          });

          
          uDet[unm.toString()] = password;
           
          try {
            var hash = bcrypt.hashSync(password, 10);
            userPwd.push(hash);
          } catch(e){
            console.log(e);
          } 
          
        }); 
         
		fse.writeFile('../psw/session.json', JSON.stringify(uDet, null, 4)).then(() => {
			console.log('success');
		}).catch(e => {
			console.log('e: ', e); 
		})
        
      
      connection.execute(
        ` declare
        type number_aat is table of number
          index by pls_integer;
        type varchar2_aat is table of varchar2(100)
          index by pls_integer;
  
        l_userID varchar2_aat := :userID;
        l_userPwd varchar2_aat := :userPwd;
        l_secId varchar2_aat := :sesId;
        l_adCat number_aat := :adCat;
      begin
        for x in l_userID.first .. l_userID.last LOOP
 
        INSERT INTO admin(ID, USER_ID, PASSWORD, REFERENCE, ADMINCATEGORY_ID)
         VALUES(adminId_generator_f(), UPPER(l_userID(x)), l_userPwd(x), l_secId(x), l_adCat(x));
        END LOOP;
      end;`,
      {
        userID: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: userID
        },
        userPwd: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: userPwd
        },
        sesId: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: sesId
        },
       
        adCat: {
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
          val: adCat
        }
	  });
	  
	  res.status(200).send({
		  msg: 'successfully inserted to db'
	  })
	//   doRelease(connection);
    }); 
    
  });
  

  router.get('/get/sessionAdmin', function(req, res, next){

    oracledb.getConnection(
      dbConfig,
      function(err, connection){
        if(err) {
          console.error(err.message);
          return;
        }
  
        connection.execute(
          `select REFERENCE, USER_ID from admin order by REFERENCE`,
  
          function(err, result){
            if(err){
              console.error(err.message);
              doRelease(connection);
              return;
            }
            res.send(result.rows);
            doRelease(connection);
          }
        )}
    )
  });




//db connection close
function doRelease(connection) {
  connection.close(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}


module.exports = router;