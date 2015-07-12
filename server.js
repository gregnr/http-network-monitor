var express = require("express");
var app = express();
var pg = require("pg");

var conString = "postgres://monitor:monitor@localhost/monitor";

app.get("/api/v1/contentTypes/", function (req, res) {

    pg.connect(conString, function(err, client, done) {

        if (err) {
            console.error("Could not connect to postgres", err);
            return;
        }
      
        client.query("SELECT NOW() AS \"theTime\"", function(err, result) {
        
            done();
            
            if (err) {
                console.error("Error running query", err);
                return;
            }
            
            console.log(result.rows[0].theTime);
        });
    });

    res.send("Hello World!");
});

var server = app.listen(80, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
