const errorObj = {
    grandChecker:  function() {

        return (userType, next)=>{
            
            if (userType !== 'grand') {
            
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
            if (userType !== 'grand' || userType !== 'departmentAdmin') {
            
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