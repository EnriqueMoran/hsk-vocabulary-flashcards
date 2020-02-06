# hsk-vocabulary-flashcards
Online chinese HSK vocabulary flashcards

This is a customizable website to help people learn and review chinese characters.
Placing the mouse over any character will show info about it: its pinyin, meaning, usage example and notes.

![alt tag](/readme_images/example_gif_1.gif)


## Data structure

Data is stored in MongoDB using the following structure:

```
{
	"character": "",
	"pinyin" : "",
	"meaning" : "",
	"level" : "",
	"example" : "",
	"notes" : ""
}
```

Character data can be edited through the website by right clicking on it.

![alt tag](/readme_images/example_gif_2.gif)


## Installation guide

Download this project, using this command: 
```
git clone https://github.com/EnriqueMoran/hsk-vocabulary-flashcards.git
```

Next, install Mongo and Node.js:
```
sudo apt-get install mongodb
sudo apt-get install nodejs
```

Create a DataBase and Collection on Mongo to store the data (in this example the DB is hakvocabulary and the collection is vocabulary):
```
mongo
>>> use hskvocabulary;
>>> db.createCollection(vocabulary);
>>> exit
```

Add the data to DataBase:
```
mongoimport --db hskvocabulary --collection vocabulary --drop --file /path/to/your/file/file_name.json
```

Fill the required parameters on *index.js* and *main.js* with your own url (it can be localhost:8080):
### index.js:
```
const url = 'ws://localhost:8080';    // must have ws://
const connection = new WebSocket(url);

```

### main.js:
```
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 })   // use the same port as on index.js

const db_name = "hskvocabulary";    // use the same database you created on MongoDB
const collection_name = "vocabulary";    // use the same collection you created on MondoDB

```

Place *main.js* at */var/www/html* and run the command:
```
node main.js 
node main.js & (if you want to run the process in background)
```