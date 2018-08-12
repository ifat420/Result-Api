const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const router = express.Router();
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');


oracledb.autoCommit = true;


// insert Course Api
router.post('/insert/course', auth, function (req, res, next) {
	if(errorFunctions.grandAndDeptAdminChecker()(req.body.user.type, next)) return;

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }
		const bindvars = {
			dn: req.body.departmentName,
			pg: req.body.program,
			se: req.body.session,
			cd: req.body.courseCode,
			crst: req.body.courseTitle,
			cc: req.body.courseCredit,
			ct: req.body.courseType,
			si: req.body.semisterId,
			tn: req.body.teacherName,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = `BEGIN insert_courses_p(:dn, :pg, :se, :cd, :crst, :cc, :ct, :si, :tn, :msg); END;`;

		const anotherCallback = function (err, result) {

			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.outBinds);
			doRelease(connection);
		}

		connection.execute(sql, bindvars, anotherCallback);
	}
	oracledb.getConnection(dbConfig, cb);

});


//get Courses
router.get('/get/course', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }
		
		const sql = `select c.course_code, c.course_title, c.course_credit, c.course_type, d.department_name, c.semester_id, s.session_desc, p.program_abbr
					from courses c, department d, session_ s, program p
					where c.SESSION_ID = s.SESSION_ID and
					s.PROGRAM_ID = p.PROGRAM_ID and
					p.DEPARTMENT_ID = d.DEPARTMENT_ID`;

		const anotherCallback = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.rows);
			doRelease(connection);
		}

		connection.execute(sql, anotherCallback);
	}

	oracledb.getConnection(dbConfig, cb);
});

//get Semester
router.get('/get/semester', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const sql = `select semester_id from semester`

		const anotherCallback = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.rows);
			doRelease(connection);
		}
 
		connection.execute(sql, anotherCallback);
	}

	oracledb.getConnection(dbConfig, cb);
});



//Update Course
router.put('/update/course/:id',auth, function (req, res, next) {


	if(errorFunctions.grandAndDeptAdminChecker(req.body.user.type, next)) return;

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const bindvars = {
			f: req.body.facultyName,
			dId: req.params.id,
			d: req.body.deptName,
			ab: req.body.dAbr,
			dc: req.body.dCode,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN update_department(:f, :dId, :d, :ab, :dc, :msg); END;";
	
		const anotherCallback = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.outBinds);
			doRelease(connection);
		}

		connection.execute(sql, bindvars, anotherCallback);
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