/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');

const router = express.Router();


oracledb.autoCommit = true;


//insert into faculty
router.post('/insert/student',auth, function (req, res, next) {
	if(errorFunctions.grandAndDeptAdminChecker(req.body.user.type, next)) return;

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			dptNm: req.body.departmentName,
			progAbb: req.body.progAbbr,
			sec: req.body.session,
			roll: req.body.roll,
			reg: req.body.reg,
			fstNm: req.body.fstName,
			lstNm: req.body.lstName,
			fNm: req.body.fatherName,
			mNm: req.body.motherName,
			pNa: req.body.phoneNumber,
			dob: req.body.dob,
			gen: req.body.gender,
			reli: req.body.religion,
			perAdd: req.body.perAdd,
			preAdd: req.body.preAdd,
			email: req.body.email,
			nt: req.body.nation,
			st: req.body.status,
			hallN: req.body.hallName,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN insert_student_info_p(:dptNm, :progAbb, :sec, :roll, :reg, :fstNm, :lstNm, :fNm, :mNm, :pNa , :dob , :gen, :reli, :perAdd, :preAdd, :email, :nt, :st, :hallN , :msg); END;";

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

router.get('/get/student', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const sql = `select s.student_first_name, s.student_second_name, s.student_email, s.STUDENT_PHONE_NUMBER, d.department_name, se.session_desc, p.program_abbr
						from student_info s, session_ se, department d, program p
						where s.session_id = se.session_id
						and se.PROGRAM_ID = p.PROGRAM_ID
						and p.DEPARTMENT_ID = d.DEPARTMENT_ID`;
		
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