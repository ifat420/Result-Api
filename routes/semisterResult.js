/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');

const router = express.Router();


oracledb.autoCommit = true;


router.post('/insert/getcreditpointmult', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			dn: req.body.departmentName,
			pg: req.body.program,
			se: req.body.session,
			si: req.body.semisterId
		};

		const sql = `select student_roll, sum( course_credit * point ), sum(course_credit)
						from FINALRESULTTABLE
						where total > 39 and semester = :si and
						session_desc = :se and 
						program_abbr = UPPER(:pg) and
						department_name = UPPER(:dn)
						group by STUDENT_ROLL order by student_roll`;

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result);
			doRelease(connection);
		}


		connection.execute(sql, bindvars, anotherCb);
	}

	oracledb.getConnection(dbConfig, cb);

});


router.post('/insert/getfailsubjects', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			dn: req.body.departmentName,
			pg: req.body.program,
			se: req.body.session,
			si: req.body.semisterId
		};

		const sql = `SELECT student_roll, LISTAGG(COURSE_CODE, ' ') WITHIN GROUP (ORDER BY COURSE_CODE) AS description
						FROM FINALRESULTTABLE WHERE total < 39  and semester = :si and
								session_desc = :se and 
								program_abbr = UPPER(:pg) and
								department_name = UPPER(:dn)
						GROUP BY STUDENT_ROLL`;

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result);
			doRelease(connection);
		}
		connection.execute(sql, bindvars, anotherCb);
	}

	oracledb.getConnection(dbConfig, cb);

});



router.post('/insert/eachstdresult', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			roll: req.body.studentRoll,
			sec: req.body.session,
			sem: req.body.semisterId
		};

		const sql = `select COURSE_CODE, COURSE_TITLE, COURSE_CREDIT, LETTER_GRADE, POINT, DEPARTMENT_NAME
						from FINALRESULTTABLE 
						WHERE STUDENT_ROLL = :roll AND
						SESSION_DESC = :sec AND
						SEMESTER = :sem`;

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result);
			doRelease(connection);
		}
		connection.execute(sql, bindvars, anotherCb);
	}

	oracledb.getConnection(dbConfig, cb);

});

router.post('/insert/stdcgpa', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			roll: req.body.studentRoll,
			sec: req.body.session,
			sem: req.body.semisterId
		};
		
		const sql = `select  sum( course_credit * point ), sum(course_credit)
					from FINALRESULTTABLE
					where total > 39 and semester = :sem and
					session_desc = :sec and 
					student_roll = :roll`;

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result);
			doRelease(connection);
		}
		connection.execute(sql, bindvars, anotherCb);
	}

	oracledb.getConnection(dbConfig, cb);

});

router.post('/insert/studentname', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			roll: req.body.studentRoll
		};

		const sql = `select student_first_name || ' ' || student_second_name from STUDENT_INFO where student_roll = :roll`;

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result);
			doRelease(connection);
		}
		connection.execute(sql, bindvars, anotherCb);
	}

	oracledb.getConnection(dbConfig, cb);

});

router.post('/insert/totalcredit', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			roll: req.body.studentRoll,
			sec: req.body.session,
			sem: req.body.semisterId
		};

		const sql = `select      sum(course_credit)
					from FINALRESULTTABLE
					where semester = :sem and
					session_desc = :sec and 
					student_roll = :roll`;

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result);
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