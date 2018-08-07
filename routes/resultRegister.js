/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');

const router = express.Router();


oracledb.autoCommit = true;


//insert into department
router.post('/insert/resultRegister', function(req, res, next){
//   console.log(req.body);
  oracledb.getConnection(
    dbConfig,
    function (err, connection) {
      if (err) { console.error(err.message); return; }
      var bindvars = {
        dn: req.body.departmentName,
        pg: req.body.program,
        se: req.body.session,
        si: req.body.semisterId,
        msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN insert_course_assign_p(:dn, :pg, :se, :si, :msg); END;",
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