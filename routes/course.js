/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');

const router = express.Router();


oracledb.autoCommit = true;


//insert into department
router.post('/insert/course', function(req, res, next){
//   console.log(req.body);
  oracledb.getConnection(
    dbConfig,
    function (err, connection) {
      if (err) { console.error(err.message); return; }
      var bindvars = {
        dn: req.body.departmentName,
        pg: req.body.program,
        se: req.body.session,
        cd: req.body.courseCode,
        crst: req.body.courseTitle,
        cc: req.body.courseCredit,
        ct: req.body.courseType,
        si: req.body.semisterId,
        tn: req.body.teacherName,

        msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      console.log(bindvars);
      connection.execute(
        `BEGIN insert_courses_p(:dn, :pg, :se, :cd, :crst, :cc, :ct, :si, :tn, :msg); END;`,
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

router.get('/get/course', function(req, res, next){

  oracledb.getConnection(
    dbConfig,
    function(err, connection){
      if(err) {
        console.error(err.message);
        return;
      }

      connection.execute(
        `select c.course_code, c.course_title, c.course_credit, c.course_type, d.department_name, c.semester_id, s.session_desc, p.program_abbr
        from courses c, department d, session_ s, program p
        where c.SESSION_ID = s.SESSION_ID and
        s.PROGRAM_ID = p.PROGRAM_ID and
        p.DEPARTMENT_ID = d.DEPARTMENT_ID`,

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


router.get('/get/semester', function(req, res, next){

  oracledb.getConnection(
    dbConfig,
    function(err, connection){
      if(err) {
        console.error(err.message);
        return;
      }

      connection.execute(
        `select semester_id from semester`,

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
router.put('/update/course/:id', function(req, res, next){
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