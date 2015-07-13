var util = require("util");
var express = require("express");
var app = express();
var pg = require("pg");

var conString = "postgres://monitor:monitor@localhost/monitor";

var endpointQueries = {
    "domains": "SELECT (regexp_matches(host, '[^.]+.[^.]+$'))[1] as domain, COUNT(*) AS total_requests FROM MessageExchange GROUP BY domain ORDER BY total_requests DESC limit 20;",
    "contenttypes": "SELECT content_type, count(*) AS total_responses FROM MessageExchange WHERE content_type IS NOT NULL GROUP BY content_type ORDER BY total_responses DESC;",
    "webservers": "SELECT server, count(*) AS total_responses FROM MessageExchange WHERE server IS NOT NULL GROUP BY server ORDER BY total_responses DESC;",
    "imagetypes": "SELECT (regexp_matches(content_type,'image/(.*)'))[1] as image_type, count(*) AS total FROM MessageExchange GROUP BY content_type ORDER BY total DESC;",
    "useragents": "SELECT user_agent, COUNT(*) AS total FROM MessageExchange GROUP BY user_agent ORDER BY total DESC limit 20;"
};

//Loop through endpoints and register them with express app
for (var endpoint in endpointQueries) {

    //Preserve scope of endpoint
    (function(endpoint) {
    
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
        
    })(endpoint);
}

//Start express app
var server = app.listen(80, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
