/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const errorFunctions = require('../routes/errorFunction');

var bcrypt = require('bcrypt');
const router = express.Router();
var jwt = require('jsonwebtoken');



oracledb.autoCommit = true;



router.get('/get/admin', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const sql = `select * from admin`;

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

router.post('/insert/login', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { console.error(err.message); return; }

		var bindvars = {
			dn: req.body.name 
		};

		const sql = `select a.id, a.password, a.reference, adg.status
		from ADMIN a, ADMINCATEGORY adg  where
		 USER_ID = UPPER(:dn) and 
		 a.ADMINCATEGORY_ID = adg.ID
		order by USER_ID`;

		const anotherCb = function (err, result) {
			if (err) {
				console.error(err.message);
				console.log('something went wrong');
				res.status(500).send({
					err: 'Internal error. Please try again'
				});
				doRelease(connection);
				return;
			}

			if(!result.rows.length) {
				res.status(401).send({
					err: 'Password or username is wrong!'
				})
				return;
			}
			let pw = result.rows[0][1]; 
			let plainPw = req.body.psw; 

			bcrypt.compare(plainPw, pw, function (err, flag) {
				if (err) {
					console.log('something went wrong');
					res.status(500).send({
						err: 'Internal error. Please try again'
					});
				}
				if (flag) {
					console.log('password matched');

					let info = {
						type: result.rows[0][3],
						uid: req.body.name 
					};

					var token = jwt.sign(info, process.env.secret, { expiresIn: '1h' });
					console.log('token: ', token);
					res.status(200).send({
						token: token,
						type: result.rows[0][3]
					})
					return;
				}
				console.log('wrong password');
				res.status(401).send({
					err: 'Password or username is wrong!'
				})
			});
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