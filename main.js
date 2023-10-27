const http = require('http');

const MongoClient = require('mongodb').MongoClient;

const user = "admin"
const pass = "n5QXBTA6RYWmvZq7"
const port = "27017"
const db_url = "mongodb://"+user+":"+pass+"@db:"+port+"/";

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 })    // add same port used on index.js

const db_name = "hskvocabulary";    // add your own db name
const collection_name = "vocabulary";    // add your own collection name


wss.on('connection', ws => {
  ws.on('message', message => {    // format -> {type - data1 - data2 (if exist)}
    var type = String(message).split("-")[0].trim();
    var message_data = String(message).split("-")[1].trim();

    if(type == "find") {
    	var query_one = message_data.split(":")[0];    // query key
	    var query_two = message_data.split(":")[1];    // query value
	    var query = { [query_one]:query_two };

	    MongoClient.connect(db_url, function(err, db) {
	  		if (err) throw err;
	  		var dbo = db.db(db_name);
	  		dbo.collection(collection_name).find(query).toArray(function(err, result) {	
	    		if (err) throw err;
	    		ws.send(JSON.stringify(result));
	    		db.close();
	  		});
		});

    } else if (type == "insertOne") {
    	MongoClient.connect(db_url, function(err, db) {
	  		if (err) throw err;
	  		var dbo = db.db(db_name);
	  		dbo.collection(collection_name).insertOne(JSON.parse(message_data), function(){
	  			if (err) throw err;
	  			db.close();
	  		});
		});

    } else if (type == "deleteOne") {
    	MongoClient.connect(db_url, function(err, db) {
	  		if (err) throw err;
	  		var dbo = db.db(db_name);
	  		dbo.collection(collection_name).deleteOne(JSON.parse(message_data), function(){
	  			if (err) throw err;
	  			db.close();
	  		});
		});

    } else if (type == "updateOne") {
    	var new_values = {$set: JSON.parse(message.toString().split("-")[2].trim())};
    	MongoClient.connect(db_url, function(err, db) {
	  		if (err) throw err;
	  		var dbo = db.db(db_name);
	  		dbo.collection(collection_name).updateOne(JSON.parse(message_data), new_values, function(){
	  			if (err) throw err;
	  			db.close();
	  		});
		});
    } 
  });
});


