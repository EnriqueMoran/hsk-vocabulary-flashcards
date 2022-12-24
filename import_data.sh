#!/bin/bash

file=hsk1_data.json # your data file

docker cp $file mongo_app:/data/db/
docker exec mongo_app mongoimport --db hskvocabulary --collection vocabulary --drop --file /data/db/hsk1_data.json

