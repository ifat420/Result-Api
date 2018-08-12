/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');

const router = express.Router();


oracledb.autoCommit = true;


//insert into CourseAssign
router.post('/insert/courseassign',auth, function (req, res, next) {

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
			si: req.body.semisterId,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.outBinds);
			doRelease(connection);
		}

		const sql = "BEGIN insert_course_assign_p(:dn, :pg, :se, :si, :msg); END;";

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