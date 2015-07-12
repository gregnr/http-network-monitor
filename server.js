var express = require("express");
var app = express();
var pg = require("pg");

var conString = "postgres://monitor:monitor@localhost/monitor";

app.get("/api/v1/hostCount/", function (req, res) {

    pg.connect(conString, function(err, client, done) {

        if (err) {
            console.error("Could not connect to postgres", err);
            return;
        }
        
        var queryString = "SELECT host, COUNT(*) AS count FROM MessageExchange GROUP BY host ORDER BY count DESC;"
      
        client.query(queryString, function(err, result) {
        
            done();
            
            if (err) {
                console.error("Error running query", err);
                return;
            }

            res.send(JSON.stringify(result.rows));
        });
    });
});

var server = app.listen(80, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
