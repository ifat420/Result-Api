var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('./dbConnection/dbConfig');

oracledb.autoCommit = true;

oracledb.getConnection(
    {
      user          : dbConfig.user,
      password      : dbConfig.password,
      connectString : dbConfig.connectString
    },
    function (err, connection) {
      if (err) { console.error(err.message); return; }
  
      var bindvars = {
        i:  'Chris',  // Bind type is determined from the data.  Default direction is BIND_IN
        id: 12,
        o:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      };
      connection.execute(
        "BEGIN inserttest(:i, :id, :o); END;",
        // The equivalent call with PL/SQL named parameter syntax is:
        // "BEGIN testproc(p_in => :i, p_inout => :io, p_out => :o); END;",
        bindvars,
        function (err, result) {
          if (err) {
            console.error(err.message);
            doRelease(connection);
            return;
          }
          console.log(result.outBinds);
          doRelease(connection);
        });
    });
  
  function doRelease(connection) {
    connection.close(
      function(err) {
        if (err) {
          console.error(err.message);
        }
      });
  }
  