#!/bin/bash

docker cp $1 mongo_app:/data/db/
docker exec mongo_app mongoimport --db hskvocabulary --collection vocabulary --drop -u admin -p yourPasswordHere --authenticationDatabase admin --file $1

