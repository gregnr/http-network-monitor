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
var conString = "postgres://monitor@localhost/monitor";

var client = new pg.Client(conString);
client.connect(function(err) {

    if (err) {
        console.error('Could not connect to postgres', err);
        return;
    }
    
    var sessionCount = 0;

    tcp_tracker.on("session", function (session) {

        console.log("Session number: ", ++sessionCount);

        console.log("Start of session between " + session.src_name + " and " + session.dst_name);
        
        
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
});
