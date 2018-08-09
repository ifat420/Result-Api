/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');
const auth = require('../middleware/auth');
const errorFunctions = require('../routes/errorFunction');


const router = express.Router();


oracledb.autoCommit = true;


//insert into department
router.post('/insert/department', auth, function (req, res, next) { 
    if(errorFunctions.grandChecker()(req.body.user.type, next)) return;  

    const cb = function (err, connection) {
        if (err) { 
            errorFunctions.dbConnError()(next);
            return;
        }
        const bindvars = {
            f: req.body.facultyName,
            d: req.body.deptName,
            ab: req.body.dAbr,
            dc: req.body.dCode,
            msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        };
        
        const sql = "BEGIN insert_department(:f, :d, :ab, :dc, :msg); END;";

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

//get all into department

router.get('/get/department', function (req, res, next) {

    const cb = function (err, connection) {
        if (err) {
            errorFunctions.dbConnError()(next);
            return;
        }

        const sql = `SELECT d.DEPARTMENT_ID, d.DEPARTMENT_NAME, d.DEPARTMENT_ABBR, d.DEPARTMENT_CODE,  f.FACULTY_NAME
                    FROM  DEPARTMENT d, FACULTY f
                    WHERE d.FACULTY_ID = f.FACULTY_ID
                    ORDER BY d.DEPARTMENT_CODE`;

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

    oracledb.getConnection(dbConfig, cb)
});



//update into department
router.put('/update/department/:id', auth, function (req, res, next) {
    
    if(errorFunctions.grandChecker()(req.body.user.type, next)) return;

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
    const ecb = function (err) {
        if (err) {
            console.error(err.message);
        }
    }

    connection.close(ecb);
}


module.exports = router;