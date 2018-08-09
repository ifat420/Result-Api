/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');

const router = express.Router();
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');

oracledb.autoCommit = true;


//insert into faculty
router.post('/insert/program', auth, function (req, res, next) {
	if(errorFunctions.grandAndDeptAdminChecker()(req.body.user.type, next)) return;

	var cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			dptNm: req.body.deptName,
			pgmNm: req.body.progName,
			pgAbr: req.body.pAbr,
			deg: req.body.deg,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN insert_program(:dptNm, :pgmNm, :pgAbr, :deg, :msg); END;";

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.outBinds);//201
			doRelease(connection);
		}

		connection.execute(sql, bindvars, anotherCb);
	}

	oracledb.getConnection(dbConfig, cb);

});

//get all into facultyd

router.get('/get/program', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const sql = `SELECT   d.department_abbr, p.program_name, f.FACULTY_NAME,
						p.program_abbr, p.degree,  d.department_name, p.program_id
						from  department d, program p, faculty f
						WHERE p.department_id = d.department_id 
						AND d.faculty_id = f.FACULTY_ID ORDER BY d.department_abbr`;
		
		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.rows);
			doRelease(connection);
		}

		connection.execute(sql, anotherCb);
	}

	oracledb.getConnection(dbConfig, cb)
});

router.get('/get/program/distinct', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const sql = `SELECT distinct program_abbr from program`;

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.rows);
			doRelease(connection);
		}

		connection.execute(sql, anotherCb);
	}

	oracledb.getConnection(dbConfig, cb)
});

//update faculty

//insert into faculty
router.put('/update/program/:pid', auth, function (req, res, next) {
	
	if(errorFunctions.grandAndDeptAdminChecker()(req.body.user.type, next)) return;

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			dptNm: req.body.deptName,
			pgId: req.params.pid,
			pgmNm: req.body.progName,
			pgAbr: req.body.pAbr,
			deg: req.body.deg,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN update_program(:dptNm, :pgId, :pgmNm, :pgAbr, :deg, :msg); END;";

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.outBinds);
			doRelease(connection);
		}

		connection.execute(sql, bindvars, anotherCb);
	}

	oracledb.getConnection(dbConfig, cb);

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