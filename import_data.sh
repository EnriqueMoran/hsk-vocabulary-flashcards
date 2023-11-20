#!/bin/bash

docker cp $1 mongo_app:/data/db/
docker exec mongo_app mongoimport --db hskvocabulary --collection vocabulary --drop -u admin -p n5QXBTA6RYWmvZq7 --authenticationDatabase admin --file /data/db/$1

