/*eslint-disable */
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConnection/dbconfig.js');

const router = express.Router();


oracledb.autoCommit = true;


//insert into faculty
router.post('/insert/markstable', function(req, res, next){ 
  var resultArray = req.body;
  var id;
  
  function resultObjectGenerator(){
    var resultObject = [];
    for(id = 0; id < resultArray.length; id += 1){
      resultObject[id] = {
        roll: resultArray[id][0],
        classTest: resultArray[id][2] ,
        attendence: resultArray[id][3],
        internalMark: resultArray[id][4],
        externalMark: resultArray[id][5],
        status: resultArray[id][6],
        courseAssignId: resultArray[id][7],
        courseId: resultArray[id][8]
      };
    }
    return resultObject;
  };

  var fillResultObject = resultObjectGenerator();
  // console.log(fillResultObject);
  
  oracledb.getConnection(dbConfig, function(err, connection){
    var roll = [];
    var classTest = [];
    var attendence = [];
    var internalMark = [];
    var externalMark = [];
    var status = [];
    var courseAssignId = [];
    var courseId = [];

    if(err) {throw err}

    for(id = 0; id < fillResultObject.length; id += 1){
      roll.push(fillResultObject[id].roll);
      classTest.push(parseFloat(fillResultObject[id].classTest));
      attendence.push(parseFloat(fillResultObject[id].attendence));
      internalMark.push(parseFloat(fillResultObject[id].internalMark));
      externalMark.push(parseFloat(fillResultObject[id].externalMark));
      status.push(fillResultObject[id].status);
      courseAssignId.push(fillResultObject[id].courseAssignId);
      courseId.push(fillResultObject[id].courseId);
    }
    connection.execute(
      ` declare
      type number_aat is table of number
        index by pls_integer;
      type varchar2_aat is table of varchar2(50)
        index by pls_integer;

      l_classTest   number_aat := :classTest;
      l_roll varchar2_aat := :roll;
      l_courseId varchar2_aat := :courseId;
      l_attendence number_aat := :attendence;
      l_internalMark number_aat := :internalMark;
      l_externalMark number_aat := :externalMark;
      l_status varchar2_aat := :status;
      l_courseAssignId number_aat := :courseAssignId;
    begin
      for x in l_roll.first .. l_roll.last LOOP
        IF l_classTest(x) = -9 then
          l_classTest(x) := NULL;
        END IF;

        IF l_attendence(x) = -9 then
          l_attendence(x) := NULL;
        END IF;

        IF l_internalMark(x) = -9 then
          l_internalMark(x) := NULL;
        END IF;

        IF l_externalMark(x) = -9 then
          l_externalMark(x) := NULL;
        END IF;

        IF l_status(x) = 'not' then
          l_status(x) := NULL;
        END IF;



        update MARKS_THEORY 
        SET CLASS_TEST = l_classTest(x),
            ATTENDANCE = l_attendence(x),
            INTERNAL_EXAMINER = l_internalMark(x),
            EXTERNAL_EXAMINER = l_externalMark(x),
            STATUS = l_status(x)
        WHERE STUDENT_ROLL = l_roll(x)
        and COURSE_ID = l_courseId(x)
        and COURSE_ASSIGN_ID = l_courseAssignId(x);
      END LOOP;
    end;`,
    {
      classTest: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: classTest
      }, 
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
      attendence: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: attendence
      },
      internalMark: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: internalMark
      },
      externalMark: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: externalMark
      },
      status: {
        type: oracledb.STRING,
        dir: oracledb.BIND_IN,
        val: status
      },
      courseAssignId: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: courseAssignId
      }
    });
  });
});

router.post('/insert/markstableFilledLab', function(req, res, next){ 
  var resultArray = req.body;

  oracledb.getConnection(dbConfig, function(err, connection){
    var roll = [];
    var cpa = [];
    var qv = [];
    var pr = [];
    var status = [];
    var courseAssignId = [];
    var courseId = [];

    if(err) {throw err}

    resultArray.forEach(element => {
        roll.push(element[0]);
        cpa.push(parseFloat(element[2]));
        qv.push(parseFloat(element[3]));
        pr.push(parseFloat(element[4]));
        status.push(element[5]);
        courseAssignId.push(element[6]);
        courseId.push(element[7]);
    });

    connection.execute(
      ` declare
      type number_aat is table of number
        index by pls_integer;
      type varchar2_aat is table of varchar2(50)
        index by pls_integer;

      l_cpa   number_aat := :cpa;
      l_roll varchar2_aat := :roll;
      l_courseId varchar2_aat := :courseId;
      l_qv number_aat := :qv;
      l_pr number_aat := :pr;
      l_status varchar2_aat := :status;
      l_courseAssignId number_aat := :courseAssignId;
    begin
      for x in l_roll.first .. l_roll.last LOOP
        IF l_cpa(x) = -9 then
          l_cpa(x) := NULL;
        END IF;

        IF l_qv(x) = -9 then
          l_qv(x) := NULL;
        END IF;

        IF l_pr(x) = -9 then
          l_pr(x) := NULL;
        END IF;

        IF l_status(x) = 'not' then
          l_status(x) := NULL;
        END IF;



        update MARKS_LAB 
        SET CPA = l_cpa(x),
            QV = l_qv(x),
            PR = l_pr(x),
            STATUS = l_status(x)
        WHERE STUDENT_ROLL = l_roll(x)
        and COURSE_ID = l_courseId(x)
        and COURSE_ASSIGN_ID = l_courseAssignId(x);
      END LOOP;
    end;`,
    {
      cpa: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: cpa
      }, 
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
      qv: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: qv
      },
      pr: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: pr
      },
      status: {
        type: oracledb.STRING,
        dir: oracledb.BIND_IN,
        val: status
      },
      courseAssignId: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: courseAssignId
      }
    });
  });
});


router.post('/insert/markstableFilledViva', function(req, res, next){ 
  var resultArray = req.body;

  oracledb.getConnection(dbConfig, function(err, connection){
    var roll = [];
    var total = [];
    var status = [];
    var courseAssignId = [];
    var courseId = [];

    if(err) {throw err}

    resultArray.forEach(element => {
        roll.push(element[0]);
        total.push(parseFloat(element[2]));
        status.push(element[3]);
        courseAssignId.push(element[4]);
        courseId.push(element[5]);
    });
   
    connection.execute(
      ` declare
      type number_aat is table of number
        index by pls_integer;
      type varchar2_aat is table of varchar2(50)
        index by pls_integer;

      l_total   number_aat := :total;
      l_roll varchar2_aat := :roll;
      l_courseId varchar2_aat := :courseId;
      l_status varchar2_aat := :status;
      l_courseAssignId number_aat := :courseAssignId;
    begin
      for x in l_roll.first .. l_roll.last LOOP
        IF l_total(x) = -9 then
          l_total(x) := NULL;
        END IF;

        IF l_status(x) = 'not' then
          l_status(x) := NULL;
        END IF;



        update MARKS_VIVA 
        SET TOTAL = l_total(x),
            STATUS = l_status(x)
        WHERE STUDENT_ROLL = l_roll(x)
        and COURSE_ID = l_courseId(x)
        and COURSE_ASSIGN_ID = l_courseAssignId(x);
      END LOOP;
    end;`,
    {
      total: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: total
      }, 
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
      status: {
        type: oracledb.STRING,
        dir: oracledb.BIND_IN,
        val: status
      },
      courseAssignId: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: courseAssignId
      }
    });
  });
});
//get all into facultyd

router.post('/insert/markstableFilledThesisProject', function(req, res, next){ 
  var resultArray = req.body;
 
  oracledb.getConnection(dbConfig, function(err, connection){
    var roll = [];
    var pr = [];
    var viva = [];
    var internalMark = [];
    var externalMark = [];
    var status = [];
    var courseAssignId = [];
    var courseId = [];

    if(err) {throw err}
    resultArray.forEach(item => {
      roll.push(item[0]);
      externalMark.push(parseFloat(item[2]));
      internalMark.push(parseFloat(item[3]));
      pr.push(parseFloat(item[4]));
      viva.push(parseFloat(item[5]));
      status.push(item[6]);
      courseAssignId.push(item[7]);
      courseId.push(item[8]);
    })

    // console.log(roll);
    // console.log(externalMark);
    // console.log(internalMark);
    // console.log(pr);
    // console.log(viva);
    // console.log(status);
    // console.log(courseAssignId);
    // console.log(courseId);
    
    connection.execute(
      ` declare
      type number_aat is table of number
        index by pls_integer;
      type varchar2_aat is table of varchar2(50)
        index by pls_integer;

      l_pr   number_aat := :pr;
      l_roll varchar2_aat := :roll;
      l_courseId varchar2_aat := :courseId;
      l_viva number_aat := :viva;
      l_internalMark number_aat := :internalMark;
      l_externalMark number_aat := :externalMark;
      l_status varchar2_aat := :status;
      l_courseAssignId number_aat := :courseAssignId;
    begin
      for x in l_roll.first .. l_roll.last LOOP
        IF l_pr(x) = -9 then
          l_pr(x) := NULL;
        END IF;

        IF l_viva(x) = -9 then
          l_viva(x) := NULL;
        END IF;

        IF l_internalMark(x) = -9 then
          l_internalMark(x) := NULL;
        END IF;

        IF l_externalMark(x) = -9 then
          l_externalMark(x) := NULL;
        END IF;

        IF l_status(x) = 'not' then
          l_status(x) := NULL;
        END IF;



        update marks_thesis_or_project 
        SET PR = l_pr(x),
            viva_voce = l_viva(x),
            internal_examiner = l_internalMark(x),
            external_examiner = l_externalMark(x),
            STATUS = l_status(x)
        WHERE STUDENT_ROLL = l_roll(x)
        and COURSE_ID = l_courseId(x)
        and COURSE_ASSIGN_ID = l_courseAssignId(x);
      END LOOP;
    end;`,
    {
      pr: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: pr
      }, 
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
      viva: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: viva
      },
      internalMark: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: internalMark
      },
      externalMark: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: externalMark
      },
      status: {
        type: oracledb.STRING,
        dir: oracledb.BIND_IN,
        val: status
      },
      courseAssignId: {
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
        val: courseAssignId
      }
    });
  });
});



//blank marksheetTheory
router.post('/insert/markstableblanktheory', function(req, res, next){ 
    oracledb.getConnection(
      dbConfig,
      function (err, connection) {
        if (err) { console.error(err.message); return; }
    
        var bindvars = {
            dn: req.body.departmentName,
            pg: req.body.program,
            se: req.body.session,
            si: req.body.semisterId
        };
        connection.execute(
          `select mt.student_roll, cor.course_title, mt.CLASS_TEST, mt.ATTENDANCE, mt.internal_examiner,mt.EXTERNAL_EXAMINER, mt.STATUS ,mt.COURSE_ASSIGN_ID, mt.COURSE_ID 
          from DEPARTMENT d, program p, session_ s, COURSE_ASSIGN ca, MARKS_THEORY mt, COURSES cor
          where d.DEPARTMENT_ID = p.DEPARTMENT_ID 
          and p.PROGRAM_ID = s.PROGRAM_ID and
          s.SESSION_ID = ca.SESSION_ID and 
          ca.COURSE_ASSIGN_ID = mt.COURSE_ASSIGN_ID and
          mt.COURSE_ID = cor.COURSE_ID and
           d.DEPARTMENT_NAME = UPPER(:dn)
          and p.PROGRAM_ABBR= UPPER(:pg)
          and s.SESSION_DESC = :se
          and ca.SEMESTER_ID = :si
          order by mt.STUDENT_ROLL, cor.COURSE_TITLE`,
          bindvars,
          function (err, result) {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            res.send(result);
            doRelease(connection);
          });
      });
  
  });



  
//blank marksheetLab
  router.post('/insert/markstableblanklab', function(req, res, next){ 
    oracledb.getConnection(
      dbConfig,
      function (err, connection) {
        if (err) { console.error(err.message); return; }
    
        var bindvars = {
            dn: req.body.departmentName,
            pg: req.body.program,
            se: req.body.session,
            si: req.body.semisterId
        };
        connection.execute(
          `select mt.student_roll, cor.course_title, mt.CPA, mt.QV, mt.PR, mt.STATUS ,mt.COURSE_ASSIGN_ID, mt.COURSE_ID 
          from DEPARTMENT d, program p, session_ s, COURSE_ASSIGN ca, MARKS_LAB mt, COURSES cor
          where d.DEPARTMENT_ID = p.DEPARTMENT_ID 
          and p.PROGRAM_ID = s.PROGRAM_ID and
          s.SESSION_ID = ca.SESSION_ID and 
          ca.COURSE_ASSIGN_ID = mt.COURSE_ASSIGN_ID and
          mt.COURSE_ID = cor.COURSE_ID and
           d.DEPARTMENT_NAME = UPPER(:dn)
          and p.PROGRAM_ABBR= UPPER(:pg)
          and s.SESSION_DESC = :se
          and ca.SEMESTER_ID = :si
          order by mt.STUDENT_ROLL, cor.COURSE_TITLE`,
          bindvars,
          function (err, result) {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            res.send(result);
            doRelease(connection);
          });
      });
  
  });

//blank marksheetLab
  router.post('/insert/markstableblankviva', function(req, res, next){ 
    oracledb.getConnection(
      dbConfig,
      function (err, connection) {
        if (err) { console.error(err.message); return; }
    
        var bindvars = {
            dn: req.body.departmentName,
            pg: req.body.program,
            se: req.body.session,
            si: req.body.semisterId
        };
        connection.execute(
          `select mt.student_roll, cor.course_title, mt.total, mt.STATUS ,mt.COURSE_ASSIGN_ID, mt.COURSE_ID 
          from DEPARTMENT d, program p, session_ s, COURSE_ASSIGN ca, MARKS_VIVA mt, COURSES cor
          where d.DEPARTMENT_ID = p.DEPARTMENT_ID 
          and p.PROGRAM_ID = s.PROGRAM_ID and
          s.SESSION_ID = ca.SESSION_ID and 
          ca.COURSE_ASSIGN_ID = mt.COURSE_ASSIGN_ID and
          mt.COURSE_ID = cor.COURSE_ID and
           d.DEPARTMENT_NAME = UPPER(:dn)
          and p.PROGRAM_ABBR= UPPER(:pg)
          and s.SESSION_DESC = :se
          and ca.SEMESTER_ID = :si
          order by mt.STUDENT_ROLL, cor.COURSE_TITLE`,
          bindvars,
          function (err, result) {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            res.send(result);
            doRelease(connection);
          });
      });
  
  });

  //blank marksheetThesisProject
  router.post('/insert/markstableblankthesisproject', function(req, res, next){ 
    oracledb.getConnection(
      dbConfig,
      function (err, connection) {
        if (err) { console.error(err.message); return; }
    
        var bindvars = {
            dn: req.body.departmentName,
            pg: req.body.program,
            se: req.body.session,
            si: req.body.semisterId
        };
        connection.execute(
          `select mt.student_roll, cor.course_title, mt.INTERNAL_EXAMINER,mt.EXTERNAL_EXAMINER, mt.PR, mt.VIVA_VOCE ,mt.STATUS ,mt.COURSE_ASSIGN_ID, mt.COURSE_ID 
          from DEPARTMENT d, program p, session_ s, COURSE_ASSIGN ca, MARKS_THESIS_OR_PROJECT mt, COURSES cor
          where d.DEPARTMENT_ID = p.DEPARTMENT_ID 
          and p.PROGRAM_ID = s.PROGRAM_ID and
          s.SESSION_ID = ca.SESSION_ID and 
          ca.COURSE_ASSIGN_ID = mt.COURSE_ASSIGN_ID and
          mt.COURSE_ID = cor.COURSE_ID and
           d.DEPARTMENT_NAME = UPPER(:dn)
          and p.PROGRAM_ABBR= UPPER(:pg)
          and s.SESSION_DESC = :se
          and ca.SEMESTER_ID = :si
          order by mt.STUDENT_ROLL, cor.COURSE_TITLE`,
          bindvars,
          function (err, result) {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            res.send(result);
            doRelease(connection);
          });
      });
  
  });





//db connection close
function doRelease(connection) {
  connection.close(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}


module.exports = router;