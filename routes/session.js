/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const router = express.Router();


oracledb.autoCommit = true;


//insert into faculty
router.post('/insert/session', auth, function(req, res, next){
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
        dptNm: req.body.deptName,
        pgmNm: req.body.progName,
        sec: req.body.session,
        acyr:   req.body.academicYr,
        msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN insert_session_p(:dptNm, :pgmNm, :sec, :acyr, :msg); END;",
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

//get all session

router.get('/get/session', function(req, res, next){

  oracledb.getConnection(
    dbConfig,
    function(err, connection){
      if(err) {
        console.error(err.message);
        return;
      }

      connection.execute(
        `select d.department_name, p.program_abbr, s.session_desc,f.faculty_name, s.session_id, d.department_abbr
        from department d, program p, session_ s, faculty f
        where s.program_id = p.program_id and
        p.department_id = d.department_id and
        d.faculty_id = f.faculty_id order by d.department_name`,

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
router.put('/update/session/:secId', auth, function(req, res, next){
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
        secId: req.params.secId,
        sec:  req.body.session,
        acyr: req.body.academicYr, 
        msg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN update_session_p(:secId, :sec, :acyr, :msg); END;",
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


router.get('/get/session/distinct', function(req, res, next){

  oracledb.getConnection(
    dbConfig,
    function(err, connection){
      if(err) {
        console.error(err.message);
        return;
      }

      connection.execute(
        `select distinct session_desc from session_ order by session_desc`,

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