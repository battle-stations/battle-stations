docker-machine start battle-stations
eval $(docker-machine env battle-stations)
docker-machine ssh battle-stations rm -rf /home/docker/app/battle-stations/app/
docker-machine ssh battle-stations mkdir -p /home/docker/app/battle-stations/
docker-machine scp -r ./app battle-stations:~/app/battle-stations/
docker-machine scp -r ./nginx battle-stations:~/app/battle-stations/
docker-compose build
docker-compose up -d
docker-machine ip battle-stations
sleep 5
curl http://battle.stations/test
