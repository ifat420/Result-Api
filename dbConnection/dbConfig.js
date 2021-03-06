module.exports = {
    user          : process.env.NODE_ORACLEDB_USER || "Addmission", 
  
    // Instead of hard coding the password, consider prompting for it,
    // passing it in an environment variable via process.env, or using
    // External Authentication.
    password      : process.env.NODE_ORACLEDB_PASSWORD || "ifat",
  
    // For information on connection strings see:
 
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "localhost:1521/orcl",
  
    // Setting externalAuth is optional.  It defaults to false.  See:
    // https://oracle.github.io/node-oracledb/doc/api.html#extauth
    externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
  };
  