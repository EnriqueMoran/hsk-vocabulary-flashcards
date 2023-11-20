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
    "pinyin"   : "",
    "meaning"  : "",
    "level"    : "",
    "example"  : "",
    "notes"    : "",
    "other"    : "",
    "type"     : ""
}
```

Character data can be edited through the website by right clicking on it.

![alt tag](/readme_images/example_gif_2.gif)


## Installation guide

Download this project, using this command: 
```
git clone https://github.com/EnriqueMoran/hsk-vocabulary-flashcards.git
```

Fill the required parameters on *index.js* and *main.js* with your own url:
### index.js:
```
const url = 'ws://localhost:3000';    // must have ws://
```

Next, install docker-compose.

Run docker-compose:
```
docker-compose up --build
```

Import data:
```
./import_data.sh hsk1_data.json
```

Note: For changing anything in BBDD (user, pass, etc), first, /data/ must be empty!
Access through X.X.X.X:8080/hsk
