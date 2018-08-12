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

// update Password department Admin
router.post('/update/deptAdmin', function(req, res, next){
	var uDet = {}
	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
		}
		uDet[req.body.deptId.toString()] =  req.body.nPsw;

		const bindvars = {
			nPwd: req.body.nPsw,
			dId: req.body.deptId
		};
		
		try {
			var hash = bcrypt.hashSync(req.body.nPsw, 10);
			bindvars.nPwd = hash;
		} catch (e) {
			console.log(e);
		}

		fse.writeFile('../psw/Updatedept.json', JSON.stringify(uDet, null, 4)).then(() => {
			console.log('success');
		}).catch(e => {
			console.log('e: ', e);
		})

		const sql = "Update Admin SET PASSWORD = :nPwd WHERE USER_ID = :dId";

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


// insert Session Admin
router.post('/insert/departmentAdmin', function (req, res, next) {
	var uDet = {}
	var resultArray = req.body;
	// console.log('resultArray: ', resultArray);

	const cb =  function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }
		var obj = req.body;
		var userID = [];

		var userPwd = [];

		var deptId = [];

		var adCat = [];



		obj.forEach(el => {
			let unm = `${el.deptAbbr}`;
			userID.push(unm);
			deptId.push(el.deptId.toString());
			adCat.push(parseFloat(2));
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

		fse.writeFile('../psw/dept.json', JSON.stringify(uDet, null, 4)).then(() => {
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
						l_deptId varchar2_aat := :deptId;
						l_adCat number_aat := :adCat;
					begin
						for x in l_userID.first .. l_userID.last LOOP
				
						INSERT INTO admin(ID, USER_ID, PASSWORD, REFERENCE, ADMINCATEGORY_ID)
						VALUES(adminId_generator_f(), UPPER(l_userID(x)), l_userPwd(x), l_deptId(x), l_adCat(x));
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
			deptId: {
				type: oracledb.STRING,
				dir: oracledb.BIND_IN,
				val: deptId
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

router.post('/update/grand', auth, function(req, res, next){
	if(errorFunctions.grandChecker()(req.body.user.type, next)) return;
	var uDet = {}
	// console.log(req.body);
	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
		}
		uDet[req.body.gId.toString()] =  req.body.nPsw;

		const bindvars = {
			nPwd: req.body.nPsw,
			gId: req.body.gId
		};
		
		try {
			var hash = bcrypt.hashSync(req.body.nPsw, 10);
			bindvars.nPwd = hash;
		} catch (e) {
			console.log(e);
		}

		fse.writeFile('../psw/grandUpdate.json', JSON.stringify(uDet, null, 4)).then(() => {
			console.log('success');
		}).catch(e => {
			console.log('e: ', e);
		})

		const sql = "Update Admin SET PASSWORD = :nPwd WHERE USER_ID = :gId";

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


router.get('/get/departmentAdmin', function (req, res, next) {

	const cb = function (err, connection) {
		if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }

		const sql = `select a.REFERENCE, a.USER_ID from admin a, ADMINCATEGORY at where at.ID = a.ADMINCATEGORY_ID and at.STATUS = 'departmentadmin'  order by REFERENCE`;

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