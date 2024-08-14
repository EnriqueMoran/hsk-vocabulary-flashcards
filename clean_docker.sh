sudo docker stop $(docker ps -aq)
sudo docker rm $(docker ps -aq)
sudo docker rmi $(docker images -q)
sudo docker volume rm $(docker volume ls -q)
sudo docker system prune -f
