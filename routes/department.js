/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');

const router = express.Router();


oracledb.autoCommit = true;


//insert into department
router.post('/insert/department', function(req, res, next){
  console.log(req.body);
  oracledb.getConnection(
    dbConfig,
    function (err, connection) {
      if (err) { console.error(err.message); return; }
      var bindvars = {
        f: req.body.facultyName,
        d: req.body.deptName,
        ab: req.body.dAbr,
        dc: req.body.dCode,

        msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN insert_department(:f, :d, :ab, :dc, :msg); END;",
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

router.get('/get/department', function(req, res, next){

  oracledb.getConnection(
    dbConfig,
    function(err, connection){
      if(err) {
        console.error(err.message);
        return;
      }

      connection.execute(
        `SELECT d.DEPARTMENT_ID, d.DEPARTMENT_NAME, d.DEPARTMENT_ABBR, d.DEPARTMENT_CODE,  f.FACULTY_NAME
        FROM  DEPARTMENT d, FACULTY f
        WHERE d.FACULTY_ID = f.FACULTY_ID
        ORDER BY d.DEPARTMENT_CODE`,

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
router.put('/update/department/:id', function(req, res, next){
  oracledb.getConnection(
    dbConfig,
    function (err, connection) {
      if (err) { console.error(err.message); return; }
      
      var bindvars = {
        f: req.body.facultyName,
        dId: req.params.id,
        d: req.body.deptName,
        ab: req.body.dAbr,
        dc: req.body.dCode,  
        msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN update_department(:f, :dId, :d, :ab, :dc, :msg); END;",
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