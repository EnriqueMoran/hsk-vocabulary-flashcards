#!/bin/bash

file=hsk1_data.json # your data file

docker cp $file mongo_app:/data/db/
docker exec mongo_app mongoimport --db hskvocabulary --collection vocabulary --drop -u admin -p n5QXBTA6RYWmvZq7 --authenticationDatabase admin --file /data/db/hsk1_data.json

