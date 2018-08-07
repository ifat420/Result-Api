const routerFac = require('../routes/faculty');
const routerProg = require('../routes/program');
const routerDept = require('../routes/department');
const routerSession= require('../routes/session');
const routerTeacher= require('../routes/teacher');
const routerStudent = require('../routes/student');
const routerHall = require('../routes/hall');
const routerCourse = require('../routes/course');
const routerCourseAssign = require('../routes/courseAssign');
const routerResultRegister = require('../routes/resultRegister');
const routerMarksTable = require('../routes/marksTable');
const routerThirdExaminer = require('../routes/thirdExaminerAssign');
const routerSemesterResult = require('../routes/semisterResult');
const routerSessionAdmin = require('../routes/sessionAdmin');
const routerLogin = require('../routes/login');


module.exports = function(app){

    app.use('/api', routerFac);  
    app.use('/api', routerProg);  
    app.use('/api', routerDept);  
    app.use('/api', routerSession);  
    app.use('/api', routerTeacher);  
    app.use('/api', routerStudent);  
    app.use('/api', routerHall);  
    app.use('/api', routerCourse);  
    app.use('/api', routerCourseAssign);  
    app.use('/api', routerResultRegister);  
    app.use('/api', routerMarksTable);  
    app.use('/api', routerThirdExaminer);  
    app.use('/api', routerSemesterResult);  
    app.use('/api', routerSessionAdmin);  
    app.use('/api', routerLogin);  
}
