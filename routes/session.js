/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');


const router = express.Router();


oracledb.autoCommit = true;


//insert into faculty
router.post('/insert/session', auth, function (req, res, next) {
	if(errorFunctions.grandAndDeptAdminChecker()(req.body.user.type, next)) return;

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			dptNm: req.body.deptName,
			pgmNm: req.body.progName,
			sec: req.body.session,
			acyr: req.body.academicYr,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN insert_session_p(:dptNm, :pgmNm, :sec, :acyr, :msg); END;";

		const anoterCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.outBinds);
			doRelease(connection);
		}

		connection.execute(sql, bindvars, anoterCb);
	}

	oracledb.getConnection(dbConfig, cb);

});

//get all session

router.get('/get/session', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const sql = `select d.department_name, p.program_abbr, s.session_desc,f.faculty_name, s.session_id, d.department_abbr, s.ACADEMIC_YEAR
						from department d, program p, session_ s, faculty f
						where s.program_id = p.program_id and
						p.department_id = d.department_id and
						d.faculty_id = f.faculty_id order by d.department_name`;

		const anoterCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.rows);
			doRelease(connection);
		}

		connection.execute(sql, anoterCb);
	}

	oracledb.getConnection(dbConfig, cb)
});


//update faculty

//insert into faculty
router.put('/update/session/:secId', auth, function (req, res, next) {
	if(errorFunctions.grandAndDeptAdminChecker()(req.body.user.type, next)) return;

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			secId: req.params.secId,
			deptNm: req.body.deptName,
			prog: req.body.progName,
			secD: req.body.session,
			acY: req.body.academicYr,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN update_session_p(:deptNm, :prog, :secId, :secD, :acY, :msg); END;";

		const anoterCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.outBinds);
			doRelease(connection);
		}

		connection.execute(sql, bindvars, anoterCb);
	}

	oracledb.getConnection(dbConfig, cb);

});


router.get('/get/session/distinct', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

	const sql = `select distinct session_desc from session_ order by session_desc`;

	const anoterCb = function (err, result) {
		if (err) {
			errorFunctions.dbQueryProblem()(next);
			doRelease(connection);
			return;
		}
		res.send(result.rows);
		doRelease(connection);
	}

		connection.execute(sql,anoterCb);
	}

	oracledb.getConnection(dbConfig, cb)
});




//db connection close
function doRelease(connection) {
	connection.close(
		function (err) {
			if (err) {
				console.error(err.message);
			}
		});
}


module.exports = router;