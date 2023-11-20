#!/bin/bash

docker exec mongo_app mongoexport --db hskvocabulary --collection vocabulary --out $1 -u admin -p yourPasswordHere --authenticationDatabase admin
docker cp mongo_app:/$1 .

