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
	ws.on('message', message => {    
	  var parts = String(message).split("-");
	  var type = parts[0] ? parts[0].trim() : null;
	  var message_data = parts[1] ? parts[1].trim() : null;
	  if (!type) {
		return;
	  }
  
	  if (type === "find") {
		let query = {};

		if (message_data && message_data.trim() !== "") {
			// Regular expression to handle key:"value with spaces" and key:value
			const regex = /(\w+):"([^"]+)"|(\w+):(\S+)/g;
			let match;
			while ((match = regex.exec(message_data.trim())) !== null) {
				if (match[1] && match[2]) {
					// Case: key:"value with spaces"
					let key = match[1].trim();
					let value = match[2].trim();

					query[key] = value;
				} else if (match[3] && match[4]) {
					// Case: key:value
					let key = match[3].trim();
					let value = match[4].trim();

					query[key] = value;
				}
			}
		}

		MongoClient.connect(db_url, function(err, db) {
			if (err) {
				console.error("Error connecting to DB:", err);
				ws.send(JSON.stringify({ error: "Error connecting to DB." }));
				return;
			}
			const dbo = db.db(db_name);
			dbo.collection(collection_name).find(query).toArray(function(err, result) {  
				if (err) {
					console.error("Error executing query:", err);
					ws.send(JSON.stringify({ error: "Error executing query." }));
					db.close();
					return;
				}
				ws.send(JSON.stringify(result));
				db.close();
			});
		});
	 } else if (type == "insertOne" && message_data) {
		MongoClient.connect(db_url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db(db_name);
		  dbo.collection(collection_name).insertOne(JSON.parse(message_data), function(){
			if (err) throw err;
			db.close();
		  });
		});
  
	  } else if (type == "deleteOne" && message_data) {
		MongoClient.connect(db_url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db(db_name);
		  dbo.collection(collection_name).deleteOne(JSON.parse(message_data), function(){
			if (err) throw err;
			db.close();
		  });
		});
  
	  } else if (type == "updateOne" && message_data) {
		var new_values = { $set: JSON.parse(parts[2].trim()) };
		MongoClient.connect(db_url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db(db_name);
		  dbo.collection(collection_name).updateOne(JSON.parse(message_data), new_values, function(){
			if (err) throw err;
			db.close();
		  });
		});
  
	  } else if (type == "findTags") {
		MongoClient.connect(db_url, function(err, db) {
			if (err) throw err;
			var dbo = db.db(db_name);
			dbo.collection(collection_name).distinct('tags', { "tags": { $exists: true, $ne: [] } }, function (err, tags) {
				if (err) throw err;
				ws.send(JSON.stringify({ type: 'tags', tags: tags.filter(tag => tag.length > 0) }));
				db.close();
			});
		});
	} else {
		console.error("Error processing message: ", String(message));
	  }
	});
  });


