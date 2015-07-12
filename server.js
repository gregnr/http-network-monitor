var pg = require('pg');

var conString = "postgres://monitor:monitor@localhost/monitor";

pg.connect(conString, function(err, client, done) {

    if (err) {
        console.error('Could not connect to postgres', err);
        return;
    }
  
    client.query('SELECT NOW() AS "theTime"', function(err, result) {
    
        if(err) {
            return console.error('Error running query', err);
        }
        
        console.log(result.rows[0].theTime);
        client.end();
    });
});
