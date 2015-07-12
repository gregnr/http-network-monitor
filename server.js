var util = require("util");
var express = require("express");
var app = express();
var pg = require("pg");

var conString = "postgres://monitor:monitor@localhost/monitor";

var endpointQueries = {
    "hostCount": "SELECT host, COUNT(*) AS count FROM MessageExchange GROUP BY host ORDER BY count DESC;"
};

//Loop through endpoints and register them with express app
for (var endpoint in endpointQueries) {

    //Make sure the key doesn't come from the object prototype
    if (endpointQueries.hasOwnProperty(endpoint)) {
    
        var queryString = endpointQueries[endpoint];
        
        //Add endpoint to express app
        app.get(util.format("/api/v1/%s/", endpoint), function (req, res) {

            //Connect to PostgreSQL database
            pg.connect(conString, function(err, client, done) {

                if (err) {
                    console.error("Could not connect to postgres", err);
                    return;
                }
                
                //Perform the query
                client.query(queryString, function(err, result) {
                
                    done();
                    
                    if (err) {
                        console.error("Error running query", err);
                        return;
                    }
                    
                    //Return rows as JSON to the client
                    res.send(JSON.stringify(result.rows));
                });
            });
        });
    }
}

//Start express app
var server = app.listen(80, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
