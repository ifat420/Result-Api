/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const router = express.Router();


oracledb.autoCommit = true;


//insert into faculty
router.post('/insert/faculty', auth, function (req, res, next) {
	if (req.body.user.type !== 'grand') {
		return res.status(401).send({
			message: 'Permission Unauthorized'
		})
	}

	const cb = function (err, connection) {
		if (err) { 
			res.status(401).send({
                message: 'Problem in Database Connection'
            })
			return; 
		}

		const bindvars = {
			i: req.body.facultyName,
			o: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN insert_faculty(:i, :o); END;"

		const anotherCb = function (err, result) {
			if (err) {
				res.status(401).send({
                    message: 'Problem in Database Query'
                });
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

router.get('/get/faculty', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) {
			res.status(401).send({
                message: 'Problem in Database Connection'
            })
			return;
		}

		const sql = "SELECT * FROM faculty ORDER BY faculty_name";

		const anotherCb = function (err, result) {
			if (err) {
				res.status(401).send({
                    message: 'Problem in Database Query'
                });
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

router.put('/update/faculty/:id', auth, function (req, res, next) {
	if (req.body.user.type !== 'grand') {
		return res.status(401).send({
			message: 'Permission Unauthorized'
		})
	}

	const cb = function (err, connection) {
		if (err) { 
			res.status(401).send({
                message: 'Problem in Database Connection'
            }) 
			return; 
		}

		const bindvars = {
			id: req.params.id,
			i: req.body.facultyName,
			o: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};

		const sql = "BEGIN update_faculty(:id, :i, :o); END;";
		
		const anotherCb = function (err, result) {
			if (err) {
				res.status(401).send({
                    message: 'Problem in Database Query'
                });
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