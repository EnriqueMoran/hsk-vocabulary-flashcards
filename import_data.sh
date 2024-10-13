#!/bin/bash

docker cp data/$1 mongo_app:/data/
docker exec mongo_app mongoimport --db hskvocabulary --collection vocabulary --drop -u admin -p n5QXBTA6RYWmvZq7 --authenticationDatabase admin --file /data/$1 --verbose

