const errorObj = {
    grandChecker:  function() {

        return (userType, next)=>{
            
            if (userType !== process.env.grand) {
            
                const err = {
                    status: 401,
                    message: 'Permission Unauthorized'
                }
                next(err);
                return true; 
            }

            return false;
        }
        
    },
    deptChecker:  function() {

        return (userType, next)=>{
            
            if (userType !== process.env.dept) {
            
                const err = {
                    status: 401,
                    message: 'Permission Unauthorized'
                }
                next(err);
                return true; 
            }

            return false;
        }
        
    },
    sessionAndDept:  function() {

        return (userType, next)=>{
            
            if (userType !== process.env.dept && userType !== process.env.session) {
            
                const err = {
                    status: 401,
                    message: 'Permission Unauthorized'
                }
                next(err);
                return true; 
            }

            return false;
        }
        
    },

    grandAndDeptAdminChecker: function(){

        return (userType, next) => {
            if (userType !== process.env.grand && userType !== process.env.dept) {
            
                const err = {
                    status: 401,
                    message: 'Permission Unauthorized'
                }
                next(err);
                return true;
            }
            return false;
        }

    },
    
    dbConnError: function(){

        return (next) => {
            const err = {
                status: 500,
                message: 'Database Connection Problem'
            }
            next();
        }
        
    },

    dbQueryProblem: function(){

        return (next) => {
            const err = {
                status: 400,
                message: 'Database Query Problem'
            }
            next(err);
        }
    }
}

module.exports = errorObj;