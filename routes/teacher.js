/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');

const router = express.Router();


oracledb.autoCommit = true;


//insert into faculty
router.post('/insert/teacher', function(req, res, next){
  
    oracledb.getConnection(
      dbConfig,
      function (err, connection) {
        if (err) { console.error(err.message); return; }
    
        var bindvars = {
          dptNm: req.body.deptName,
          tN: req.body.teacherName,
          tD: req.body.teacherDesc,
          tE:   req.body.teacherEmail,
          tP:   req.body.teacherPhone,
          msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        };
        connection.execute(
          "BEGIN insert_teacher_p(:dptNm, :tN, :tD, :tE, :tP , :msg); END;",
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

router.get('/get/teacher', function(req, res, next){

  oracledb.getConnection(
    dbConfig,
    function(err, connection){
      if(err) {
        console.error(err.message);
        return;
      }

      connection.execute(
        `select t.teacher_name, t.teacher_designation, t.email, t.mobile_number, f.faculty_name, d.DEPARTMENT_NAME, t.teacher_id
        from teacher t, department d, faculty f
        where t.DEPARTMENT_ID = d.DEPARTMENT_ID
        AND d.FACULTY_ID = f.FACULTY_ID`,

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
router.put('/update/teacher/:tId', function(req, res, next){
  
  oracledb.getConnection(
    dbConfig,
    function (err, connection) {
      if (err) { console.error(err.message); return; }
  
      var bindvars = {
        dptNm: req.body.deptName,
          tN: req.body.teacherName,
          tD: req.body.teacherDesc,
          tE:   req.body.teacherEmail,
          tP:   req.body.teacherPhone,
          tecId: req.params.tId,
          msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN update_teacher_p(:dptNm, :tN, :tD, :tE, :tP, :tecId , :msg); END;",
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