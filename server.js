var util = require("util");
var express = require("express");
var pg = require("pg");

var conString = "postgres://monitor:monitor@localhost/monitor";

var endpointQueries = {
    "domains": "SELECT (regexp_matches(host, '[^.]+.[^.]+$'))[1] as domain, COUNT(*) AS total_requests FROM MessageExchange GROUP BY domain ORDER BY total_requests DESC limit 20;",
    "hourlytraffic": "SELECT DATE_PART('hour', response_timestamp) as hour, SUM(content_length) AS content_length_total FROM MessageExchange  WHERE (now() - response_timestamp) < (INTERVAL '1 day') GROUP BY DATE_PART('hour', response_timestamp) ORDER BY hour DESC;",
    "contenttypes": "SELECT content_type, count(*) AS total_responses FROM MessageExchange WHERE content_type IS NOT NULL GROUP BY content_type ORDER BY total_responses DESC;",
 	"recentimages": "SELECT (regexp_matches(content_type,'image/(.*)'))[1] as image_type, concat(host, url), response_timestamp FROM MessageExchange WHERE content_length > 50000 ORDER BY response_timestamp DESC limit 100;",
    "webservers": "SELECT server, count(*) AS total_responses FROM MessageExchange WHERE server IS NOT NULL GROUP BY server ORDER BY total_responses DESC limit 20;",
    "imagetypes": "SELECT (regexp_matches(content_type,'image/(.*)'))[1] as image_type, count(*) AS total FROM MessageExchange GROUP BY content_type ORDER BY total DESC;",
    "domaindata": "SELECT (regexp_matches(host, '[^.]+.[^.]+$'))[1] as domain, SUM(content_length) AS content_length_total FROM MessageExchange WHERE content_length>0 GROUP BY domain ORDER BY content_length_total DESC limit 20;",
    "useragents": "SELECT user_agent, COUNT(*) AS total FROM MessageExchange GROUP BY user_agent ORDER BY total DESC limit 20;"
   
};

var app = express();

//Serve static files from static directory
app.use(express.static("static"));

//Loop through endpoints and register them with express app
for (var endpoint in endpointQueries) {

    //Preserve scope of endpoint
    (function(endpoint) {
    
        //Make sure the key doesn't come from the object prototype
        if (endpointQueries.hasOwnProperty(endpoint)) {
        
            var queryString = endpointQueries[endpoint];
            
            //Add endpoint to express app
            app.get(util.format("/api/v1/%s/", endpoint), function (req, res) {

                res.header("Content-Type", "application/json");
                
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
                            res.send(JSON.stringify({error: err}));
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

    console.log("App listening at http://%s:%s", host, port);
});
