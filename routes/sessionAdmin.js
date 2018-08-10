/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
var generator = require('generate-password');
var bcrypt = require('bcrypt');
var fse = require('fs-extra');
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');


const router = express.Router();


oracledb.autoCommit = true;

// insert Session Admin


router.post('/update/sessionAdmin', function(req, res, next){
	var uDet = {}
	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
		}
		uDet[req.body.sessionId.toString()] =  req.body.nPsw;

		const bindvars = {
			nPwd: req.body.nPsw,
			sId: req.body.sessionId
		};
		
		try {
			var hash = bcrypt.hashSync(req.body.nPsw, 10);
			bindvars.nPwd = hash;
		} catch (e) {
			console.log(e);
		}

		fse.writeFile('../psw/Updatesession.json', JSON.stringify(uDet, null, 4)).then(() => {
			console.log('success');
		}).catch(e => {
			console.log('e: ', e);
		})

		const sql = "Update Admin SET PASSWORD = :nPwd WHERE USER_ID = :sId";

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
})

router.post('/insert/sessionAdmin', function (req, res, next) {
	var uDet = {}
	var resultArray = req.body;

	const cb =  function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }
		var obj = req.body;
		var userID = [];

		var userPwd = [];

		var sesId = [];

		var adCat = [];



		obj.forEach(el => {
			let unm = `${el.deptAbbr}-${el.sesDes}`;
			userID.push(unm);
			sesId.push(el.sesId.toString());
			adCat.push(parseFloat(3));
			let password = generator.generate({
				length: 6,
				numbers: true
			});


			uDet[unm.toString()] = password;

			try {
				var hash = bcrypt.hashSync(password, 10);
				userPwd.push(hash);
			} catch (e) {
				console.log(e);
			}

		});

		fse.writeFile('../psw/session.json', JSON.stringify(uDet, null, 4)).then(() => {
			console.log('success');
		}).catch(e => {
			console.log('e: ', e);
		})
		
		const sql = ` declare
						type number_aat is table of number
						index by pls_integer;
						type varchar2_aat is table of varchar2(100)
						index by pls_integer;
				
						l_userID varchar2_aat := :userID;
						l_userPwd varchar2_aat := :userPwd;
						l_secId varchar2_aat := :sesId;
						l_adCat number_aat := :adCat;
					begin
						for x in l_userID.first .. l_userID.last LOOP
				
						INSERT INTO admin(ID, USER_ID, PASSWORD, REFERENCE, ADMINCATEGORY_ID)
						VALUES(adminId_generator_f(), UPPER(l_userID(x)), l_userPwd(x), l_secId(x), l_adCat(x));
						END LOOP;
					end;`;

		const bindvars = {
			userID: {
				type: oracledb.STRING,
				dir: oracledb.BIND_IN,
				val: userID
			},
			userPwd: {
				type: oracledb.STRING,
				dir: oracledb.BIND_IN,
				val: userPwd
			},
			sesId: {
				type: oracledb.STRING,
				dir: oracledb.BIND_IN,
				val: sesId
			},

			adCat: {
				type: oracledb.NUMBER,
				dir: oracledb.BIND_IN,
				val: adCat
			}
		}

		connection.execute(sql, bindvars);

		res.status(200).send({
			msg: 'successfully inserted to db'
		})
		//   doRelease(connection);
	}

	oracledb.getConnection(dbConfig, cb);

});


router.get('/get/sessionAdmin', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const sql = `select a.REFERENCE, a.USER_ID from admin a, ADMINCATEGORY at where at.ID = a.ADMINCATEGORY_ID and at.STATUS = 'sessionadmin'  order by REFERENCE`;

		const anoterCb = function (err, result) {
			if (err) {
                errorFunctions.dbQueryProblem()(next);
                doRelease(connection);
                return;
            }
			res.send(result.rows);
			doRelease(connection);
		}

		connection.execute(sql, anoterCb);
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