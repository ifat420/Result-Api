/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');

const router = express.Router();


oracledb.autoCommit = true;


//insert into department
router.post('/insert/resultRegister', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) {
			errorFunctions.dbConnError()(next);
			return;
		}

		var bindvars = {
			dn: req.body.departmentName,
			pg: req.body.program,
			se: req.body.session,
			si: req.body.semisterId,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN insert_course_assign_p(:dn, :pg, :se, :si, :msg); END;";

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