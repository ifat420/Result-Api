/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');

const router = express.Router();


oracledb.autoCommit = true;


//insert into department
router.post('/insert/hall', auth, function (req, res, next) {
	if (errorFunctions.grandChecker()(req.body.user.type, next)) return;

	const cb = function (err, connection) {
		
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }
		
		const bindvars = {
			n: req.body.name,
			t: req.body.type,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN insert_residential_hall_p(:t, :n, :msg); END;";

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

//get all into department

router.get('/get/hall', function (req, res, next) {

	const cb = function (err, connection) {
		
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const sql = `select * from RESIDENTIAL_HALL`;

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.rows);
			doRelease(connection);
		}

		connection.execute(sql,anotherCb);
	}

	oracledb.getConnection(dbConfig, cb);
});

//update faculty

//insert into faculty
router.put('/update/hall/:id', auth, function (req, res, next) {
	if (errorFunctions.grandChecker()(req.body.user.type, next)) return;

	const cb = function (err, connection) {
		
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		var bindvars = {
			n: req.body.name,
			t: req.body.type,
			hid: req.params.id,
			msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN update_res_hall_p(:hid, :t, :n, :msg); END;";

		const anotherCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.outBinds);
			doRelease(connection);
		}

		connection.execute(sql,bindvars,anotherCb);
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