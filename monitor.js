var util = require("util");
var fs = require("fs");
var path  = require("path");
var pg = require("pg");

var HTTPParser = require("./node-http-parser/http-parser");

var pcapBufferSize = 50 * 1024 * 1024 //50MB

var pcap = require("pcap"),
    tcp_tracker = new pcap.TCPTracker(),
    pcap_session = pcap.createSession("eth0", "tcp port 80", pcapBufferSize);
    
console.log("Listening for packets");

//Connect to database
var conString = "postgres://monitor:monitor@localhost/monitor";

    var sessionCount = 0;

    tcp_tracker.on("session", function (session) {

        console.log("Session number: ", ++sessionCount);

        console.log("Start of session between " + session.src + " and " + session.dst);
        
        var sourceSplit = session.src.split(":");
        var sourceAddress = sourceSplit[0];
        var sourcePort = sourceSplit[1];
        
        var destinationSplit = session.dst.split(":");
        var destinationAddress = destinationSplit[0];
        var destinationPort = destinationSplit[1];
        
        //Private variables:
        
        var requestParser = new HTTPParser.RequestParser();
        var responseParser = new HTTPParser.ResponseParser();

        //Queues to store multiple requests/responses when pipelining
        var requestQueue = [];
        var responseQueue = [];
        
        
        //Private functions:
        
        var checkQueues = function() {
            
            var shortestQueueLength = Math.min(requestQueue.length, responseQueue.length);
            
            for (var i = 0; i < shortestQueueLength; i++) {
                
                //Take the lowest element off each queue
                var request = requestQueue.shift();
                var response = responseQueue.shift();
                
                console.log();
                console.log("Message exchange complete!");
                console.log("Request:", request.method, request.url);
                console.log("Response:", response.statusCode);
                console.log("Response Headers:", response.headers);
                console.log();
                
                var source_ipaddress = sourceAddress;
                var source_port = sourcePort;
                var destination_ipaddress = destinationAddress;
                var destination_port = destinationPort;
                var request_type = request.method;
                var url = request.url;
                var http_version = request.version;
                var host = request.headers["host"];
                var user_agent = request.headers["user-agent"];
                var request_timestamp = new Date().getTime() / 1000; //TODO: Change to actual request time
                var status_code = response.statusCode;
                var content_length = response.headers["content-length"];
                var content_type = response.headers["content-type"];
                var content_encoding = response.headers["content-encoding"];
                var server = response.headers["server"];
                var response_timestamp = new Date().getTime() / 1000; //TODO: Change to actual response time
                var response_body_location = null;
                
                var queryTemplate = "INSERT INTO MessageExchange (" + 
                                    "   source_ipaddress," + 
                                    "   source_port," + 
                                    "   destination_ipaddress," + 
                                    "   destination_port," + 
                                    "   request_type," + 
                                    "   url," + 
                                    "   http_version," + 
                                    "   host," + 
                                    "   user_agent," + 
                                    "   request_timestamp," + 
                                    "   status_code," + 
                                    "   content_length," + 
                                    "   content_type," + 
                                    "   content_encoding," + 
                                    "   server," + 
                                    "   response_timestamp," +
                                    "   response_body_location" + 
                                    ") Values (" + 
                                    "   %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s" + 
                                    ");";
                                    
                var queryString = util.format(queryTemplate,
                        source_ipaddress        ? util.format("'%s'", source_ipaddress) : "NULL",
                        source_port             ? util.format("%d", source_port) : "NULL",
                        destination_ipaddress   ? util.format("'%s'", destination_ipaddress) : "NULL",
                        destination_port        ? util.format("%d", destination_port) : "NULL",
                        request_type            ? util.format("'%s'", request_type) : "NULL",
                        url                     ? util.format("'%s'", url) : "NULL",
                        http_version            ? util.format("'%s'", http_version) : "NULL",
                        host                    ? util.format("'%s'", host) : "NULL",
                        user_agent              ? util.format("'%s'", user_agent) : "NULL",
                        request_timestamp       ? util.format("to_timestamp(%d)", request_timestamp) : "NULL",
                        status_code             ? util.format("%d", status_code) : "NULL",
                        content_length          ? util.format("%d", content_length) : "NULL",
                        content_type            ? util.format("'%s'", content_type) : "NULL",
                        content_encoding        ? util.format("'%s'", content_encoding) : "NULL",
                        server                  ? util.format("'%s'", server) : "NULL",
                        response_timestamp      ? util.format("to_timestamp(%d)", request_timestamp) : "NULL",
                        response_body_location  ? util.format("'%s'", response_body_location) : "NULL"
                );
                
                pg.connect(conString, function(err, client, done) {
                
                    var query = client.query(queryString, function(err, result) {
                    
                        done();
                        
                        if (err) {
                            console.error("Error running query", err);
                            return;
                        }
                        
                        console.log("Database insert successful");
                        console.log();
                    });
                });
            }
        };
        
        requestParser.on("headersLoaded", function(headers) {
        
            //console.log("Request headers loaded: ", headers);
        });
        
        requestParser.on("bodyLoaded", function(body) {
        
            //console.log("Request body loaded:", body.toString());
        });
        
        requestParser.on("parseComplete", function(httpObject) {
        
            //console.log("Request parse complete");
            
            requestQueue.push(httpObject);
            checkQueues();
        });
        
        requestParser.on("error", function(error) {
            
            console.log("There was an error parsing a request.");
        });
        
        responseParser.on("headersLoaded", function(headers) {
        
            //console.log("Response headers loaded: ", headers);
        });
        
        responseParser.on("bodyLoaded", function(body) {
        
            //console.log("Response body loaded");
        });
        
        responseParser.on("parseComplete", function(httpObject) {
        
            //console.log("Response parse complete");
            
            responseQueue.push(httpObject);
            checkQueues();
        });
        
        responseParser.on("error", function(error) {
            
            console.log("There was an error parsing a response.");
        });

        //var requestStream = fs.createWriteStream("capture/" + session.src_name + "_REQUEST", {flags: 'w'});
        
        session.on("data send", function (session, chunk) {
        
            requestParser.pushChunk(chunk);
            
            //var copy = new Buffer(chunk);
            //requestStream.write(copy);
        });

        //var responseStream = fs.createWriteStream("capture/" + session.src_name + "_RESPONSE", {flags: 'w'});
        
        session.on("data recv", function (session, chunk) {
        
            responseParser.pushChunk(chunk);
            
            //var copy = new Buffer(chunk);
            //responseStream.write(copy);
        });

        session.on("end", function (session) {

            console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
        });
    });


    pcap_session.on("packet", function (raw_packet) {

        var packet = pcap.decode.packet(raw_packet);
        tcp_tracker.track_packet(packet);
    });
