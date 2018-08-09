/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');

const router = express.Router();


oracledb.autoCommit = true;


router.post('/insert/marksThirdExaminerTheory', function (req, res, next) {

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

		const sql = `select mt.student_roll, cor.course_title, mt.THIRD_EXAMINER, mt.COURSE_ASSIGN_ID, mt.COURSE_ID 
						from DEPARTMENT d, program p, session_ s, COURSE_ASSIGN ca, MARKS_THEORY mt, COURSES cor
						where ABS(mt.EXTERNAL_EXAMINER-mt.INTERNAL_EXAMINER) > 14.5 and
						d.DEPARTMENT_ID = p.DEPARTMENT_ID 
						and p.PROGRAM_ID = s.PROGRAM_ID and
						s.SESSION_ID = ca.SESSION_ID and 
						ca.COURSE_ASSIGN_ID = mt.COURSE_ASSIGN_ID and
						mt.COURSE_ID = cor.COURSE_ID and
						d.DEPARTMENT_NAME = UPPER(:dn)
						and p.PROGRAM_ABBR= UPPER(:pg)
						and s.SESSION_DESC = :se
						and ca.SEMESTER_ID = :si
						order by mt.STUDENT_ROLL, cor.COURSE_TITLE`;

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


router.post('/insert/marksThirdExaminerThesisProject', function (req, res, next) {

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

		const sql = `select mt.student_roll, cor.course_title, mt.THIRD_EXAMINER, mt.COURSE_ASSIGN_ID, mt.COURSE_ID 
						from DEPARTMENT d, program p, session_ s, COURSE_ASSIGN ca, MARKS_THESIS_OR_PROJECT mt, COURSES cor
						where ABS(mt.EXTERNAL_EXAMINER-mt.INTERNAL_EXAMINER) > 14.5 and
						d.DEPARTMENT_ID = p.DEPARTMENT_ID 
						and p.PROGRAM_ID = s.PROGRAM_ID and
						s.SESSION_ID = ca.SESSION_ID and 
						ca.COURSE_ASSIGN_ID = mt.COURSE_ASSIGN_ID and
						mt.COURSE_ID = cor.COURSE_ID and
						d.DEPARTMENT_NAME = UPPER(:dn)
						and p.PROGRAM_ABBR= UPPER(:pg)
						and s.SESSION_DESC = :se
						and ca.SEMESTER_ID = :si
						order by mt.STUDENT_ROLL, cor.COURSE_TITLE`

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


router.post('/insert/marksTableThirdExaminerTheory', function (req, res, next) {
	var resultArray = req.body;

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
		}
		
		var roll = [];
		var thirdExaminer = [];
		var courseAssignId = [];
		var courseId = [];


		resultArray.forEach(item => {
			roll.push(item[0]);
			thirdExaminer.push(parseFloat(item[2]));
			courseAssignId.push(item[3]);
			courseId.push(item[4]);
		})

		const sql = ` declare
						type number_aat is table of number
						index by pls_integer;
						type varchar2_aat is table of varchar2(50)
						index by pls_integer;
				
						l_roll varchar2_aat := :roll;
						l_courseId varchar2_aat := :courseId;
						l_thirdExaminer number_aat := :thirdExaminer;
						l_courseAssignId number_aat := :courseAssignId;
					begin
						for x in l_roll.first .. l_roll.last LOOP
				
						IF l_thirdExaminer(x) = -9 then
							l_thirdExaminer(x) := NULL;
						END IF;
					
						update MARKS_THEORY 
						SET THIRD_EXAMINER = l_thirdExaminer(x)
						WHERE STUDENT_ROLL = l_roll(x)
						and COURSE_ID = l_courseId(x)
						and COURSE_ASSIGN_ID = l_courseAssignId(x);
						END LOOP;
					end;`;

		const bindvars = {
			roll: {
				type: oracledb.STRING,
				dir: oracledb.BIND_IN,
				val: roll
			},
			courseId: {
				type: oracledb.STRING,
				dir: oracledb.BIND_IN,
				val: courseId
			},
			thirdExaminer: {
				type: oracledb.NUMBER,
				dir: oracledb.BIND_IN,
				val: thirdExaminer
			},
			courseAssignId: {
				type: oracledb.NUMBER,
				dir: oracledb.BIND_IN,
				val: courseAssignId
			}
		}

		connection.execute(sql, bindvars);
		res.status(200).send({
			msg: 'successfully inserted to db'
		})
	}

	oracledb.getConnection(dbConfig, cb);
});


router.post('/insert/marksTableThirdExaminerThesisProject', function (req, res, next) {
	var resultArray = req.body;

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var roll = [];
		var thirdExaminer = [];
		var courseAssignId = [];
		var courseId = [];

		resultArray.forEach(item => {
			roll.push(item[0]);
			thirdExaminer.push(parseFloat(item[2]));
			courseAssignId.push(item[3]);
			courseId.push(item[4]);
		})

		const sql = ` declare
						type number_aat is table of number
						index by pls_integer;
						type varchar2_aat is table of varchar2(50)
						index by pls_integer;
				
						l_roll varchar2_aat := :roll;
						l_courseId varchar2_aat := :courseId;
						l_thirdExaminer number_aat := :thirdExaminer;
						l_courseAssignId number_aat := :courseAssignId;
					begin
						for x in l_roll.first .. l_roll.last LOOP
				
						IF l_thirdExaminer(x) = -9 then
							l_thirdExaminer(x) := NULL;
						END IF;
					
						update MARKS_THESIS_OR_PROJECT 
						SET THIRD_EXAMINER = l_thirdExaminer(x)
						WHERE STUDENT_ROLL = l_roll(x)
						and COURSE_ID = l_courseId(x)
						and COURSE_ASSIGN_ID = l_courseAssignId(x);
						END LOOP;
					end;`;

		const bindvars = {
			roll: {
				type: oracledb.STRING,
				dir: oracledb.BIND_IN,
				val: roll
			},
			courseId: {
				type: oracledb.STRING,
				dir: oracledb.BIND_IN,
				val: courseId
			},
			thirdExaminer: {
				type: oracledb.NUMBER,
				dir: oracledb.BIND_IN,
				val: thirdExaminer
			},
			courseAssignId: {
				type: oracledb.NUMBER,
				dir: oracledb.BIND_IN,
				val: courseAssignId
			}
		}

		connection.execute(sql, bindvars);
		res.status(200).send({
			msg: 'successfully inserted to db'
		})
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