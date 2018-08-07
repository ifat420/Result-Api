/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');

const router = express.Router();


oracledb.autoCommit = true;


router.post('/insert/getcreditpointmult', function(req, res, next){ 
    oracledb.getConnection(
      dbConfig,
      function (err, connection) {
        if (err) { console.error(err.message); return; }
    
        var bindvars = {
            dn: req.body.departmentName,
            pg: req.body.program,
            se: req.body.session,
            si: req.body.semisterId
        };
        connection.execute(
          `select student_roll, sum( course_credit * point ), sum(course_credit)
          from FINALRESULTTABLE
          where total > 39 and semester = :si and
          session_desc = :se and 
          program_abbr = UPPER(:pg) and
          department_name = UPPER(:dn)
          group by STUDENT_ROLL order by student_roll
          `,
          bindvars,
          function (err, result) {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            res.send(result);
            doRelease(connection);
          });
      });
  
  });
router.post('/insert/getfailsubjects', function(req, res, next){ 
    oracledb.getConnection(
      dbConfig,
      function (err, connection) {
        if (err) { console.error(err.message); return; }
    
        var bindvars = {
            dn: req.body.departmentName,
            pg: req.body.program,
            se: req.body.session,
            si: req.body.semisterId
        };
        connection.execute(
          `SELECT student_roll, LISTAGG(COURSE_CODE, ' ') WITHIN GROUP (ORDER BY COURSE_CODE) AS description
          FROM FINALRESULTTABLE WHERE total < 39  and semester = :si and
                    session_desc = :se and 
                    program_abbr = UPPER(:pg) and
                    department_name = UPPER(:dn)
          
          GROUP BY STUDENT_ROLL`,
          bindvars,
          function (err, result) {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            res.send(result);
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