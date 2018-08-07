/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');

const router = express.Router();


oracledb.autoCommit = true;


//insert into faculty
router.post('/insert/program', function(req, res, next){
  
  oracledb.getConnection(
    dbConfig,
    function (err, connection) {
      if (err) { console.error(err.message); return; }
  
      var bindvars = {
        dptNm: req.body.deptName,
        pgmNm: req.body.progName,
        pgAbr: req.body.pAbr,
        deg:   req.body.deg,
        msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN insert_program(:dptNm, :pgmNm, :pgAbr, :deg, :msg); END;",
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

//get all into facultyd

router.get('/get/program', function(req, res, next){

  oracledb.getConnection(
    dbConfig,
    function(err, connection){
      if(err) {
        console.error(err.message);
        return;
      }

      connection.execute(
        `SELECT   d.department_abbr, p.program_name, f.FACULTY_NAME,
        p.program_abbr, p.degree,  d.department_name, p.program_id
        from  department d, program p, faculty f
        WHERE p.department_id = d.department_id 
        AND d.faculty_id = f.FACULTY_ID ORDER BY d.department_abbr`,

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

router.get('/get/program/distinct', function(req, res, next){

  oracledb.getConnection(
    dbConfig,
    function(err, connection){
      if(err) {
        console.error(err.message);
        return;
      }

      connection.execute(
        `SELECT distinct program_abbr
        from program`,

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
router.put('/update/program/:pid', function(req, res, next){
  console.log(req.body);
  oracledb.getConnection(
    dbConfig,
    function (err, connection) {
      if (err) { console.error(err.message); return; }
      var bindvars = {
        dptNm: req.body.deptName,
        pgId: req.params.pid,
        pgmNm: req.body.progName,
        pgAbr: req.body.pAbr,
        deg:   req.body.deg, 
        msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN update_program(:dptNm, :pgId, :pgmNm, :pgAbr, :deg, :msg); END;",
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