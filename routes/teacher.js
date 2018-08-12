/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');


const router = express.Router();


oracledb.autoCommit = true;


//insert into faculty
router.post('/insert/teacher', auth, function (req, res, next) {

	if(errorFunctions.grandChecker()(req.body.user.type, next)) return;

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			dptNm: req.body.deptName,
			tN: req.body.teacherName,
			tD: req.body.teacherDesc,
			tE: req.body.teacherEmail,
			tP: req.body.teacherPhone,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN insert_teacher_p(:dptNm, :tN, :tD, :tE, :tP , :msg); END;";

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

//get all into facultyd

router.get('/get/teacher', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const sql = `select t.teacher_name, t.teacher_designation, t.email, t.mobile_number, f.faculty_name, d.DEPARTMENT_NAME, t.teacher_id
						from teacher t, department d, faculty f
						where t.DEPARTMENT_ID = d.DEPARTMENT_ID
						AND d.FACULTY_ID = f.FACULTY_ID`
		
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

	oracledb.getConnection(dbConfig, cb);
});

//update faculty

//insert into faculty
router.put('/update/teacher/:tId', auth, function (req, res, next) {

	if(errorFunctions.grandChecker()(req.body.user.type, next)) return;

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			dptNm: req.body.deptName,
			tN: req.body.teacherName,
			tD: req.body.teacherDesc,
			tE: req.body.teacherEmail,
			tP: req.body.teacherPhone,
			tecId: req.params.tId,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN update_teacher_p(:dptNm, :tN, :tD, :tE, :tP, :tecId , :msg); END;";

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