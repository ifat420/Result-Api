/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const router = express.Router();


oracledb.autoCommit = true;


//insert into department
router.post('/insert/hall', auth, function(req, res, next){
  if(req.body.user.type !== 'grand'){
		return res.status(401).send({
			message: 'Permission Unauthorized'
		})
	}
  oracledb.getConnection(
    dbConfig,
    function (err, connection) {
      if (err) { console.error(err.message); return; }
      var bindvars = {
        n: req.body.name,
        t: req.body.type,       
        msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN insert_residential_hall_p(:t, :n, :msg); END;",
        bindvars,
        function (err, result) {
          if (err) {
            console.error(err.message);
            doRelease(connection);
            return;
          }
          res.send(result.outBinds);
          doRelease(connection);
        });
    });

});

//get all into department

router.get('/get/hall', function(req, res, next){

  oracledb.getConnection(
    dbConfig,
    function(err, connection){
      if(err) {
        console.error(err.message);
        return;
      }

      connection.execute(
        `select * from RESIDENTIAL_HALL`,

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

//update faculty

//insert into faculty
router.put('/update/hall/:id',auth, function(req, res, next){
  if(req.body.user.type !== 'grand'){
		return res.status(401).send({
			message: 'Permission Unauthorized'
		})
	}
  oracledb.getConnection(
    dbConfig,
    function (err, connection) {
      if (err) { console.error(err.message); return; }
      
      var bindvars = {
        n: req.body.name,
        t: req.body.type, 
        hid: req.params.id,       
        msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN update_res_hall_p(:hid, :t, :n, :msg); END;",
        bindvars,
        function (err, result) {
          if (err) {
            console.error(err.message);
            doRelease(connection);
            return;
          }
          res.send(result.outBinds);
          doRelease(connection);
        });
    });

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