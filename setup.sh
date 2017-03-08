cd app/ && npm install
docker-machine create --driver "virtualbox" battle-stations
cd ..
docker-machine scp -r ./nginx battle-stations:~/app/battle-stations/
./update.sh
