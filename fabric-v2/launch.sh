#!/bin/bash

function gen_needed(){
mkdir channel-artifacts
export CHANNEL_NAME=ourchannel
export FABRIC_CFG_PATH=$PWD
./cryptogen generate --config=./crypto-config.yaml
./configtxgen -profile ProfileTest -outputBlock ./channel-artifacts/genesis.block
./configtxgen -profile ChannelTest -outputCreateChannelTx ./channel-artifacts/channel.tx   -channelID ourchannel
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/manuf1MSPanchors.tx -channelID ourchannel -asOrg manuf1
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/manuf2MSPanchors.tx -channelID ourchannel -asOrg manuf2
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/distr1MSPanchors.tx -channelID ourchannel -asOrg distr1
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/distr2MSPanchors.tx -channelID ourchannel -asOrg distr2
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/logistic1MSPanchors.tx -channelID ourchannel -asOrg logistic1
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/logistic2MSPanchors.tx -channelID ourchannel -asOrg logistic2
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/pharmacy1MSPanchors.tx -channelID ourchannel -asOrg pharmacy1
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/pharmacy2MSPanchors.tx -channelID ourchannel -asOrg pharmacy2
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/ia1MSPanchors.tx -channelID ourchannel -asOrg ia1
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/ia2MSPanchors.tx -channelID ourchannel -asOrg ia2
}


function join_channel() {
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c ourchannel -f /etc/hyperledger/configtx/channel.tx
docker exec peer0.manuf1.meditrack.com cp ourchannel.block /etc/hyperledger/configtx
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf2.meditrack.com/msp" peer0.manuf2.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@distr1.meditrack.com/msp" peer0.distr1.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@distr2.meditrack.com/msp" peer0.distr2.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logistic1.meditrack.com/msp" peer0.logistic1.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logistic2.meditrack.com/msp" peer0.logistic2.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmacy1.meditrack.com/msp" peer0.pharmacy1.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmacy2.meditrack.com/msp" peer0.pharmacy2.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia1.meditrack.com/msp" peer0.ia1.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia2.meditrack.com/msp" peer0.ia2.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
}

function update_anchorPeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer channel update -f /etc/hyperledger/configtx/manuf1MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf2.meditrack.com/msp" peer0.manuf2.meditrack.com peer channel update -f /etc/hyperledger/configtx/manuf2MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@distr1.meditrack.com/msp" peer0.distr1.meditrack.com peer channel update -f /etc/hyperledger/configtx/distr1MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@distr2.meditrack.com/msp" peer0.distr2.meditrack.com peer channel update -f /etc/hyperledger/configtx/distr2MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logistic1.meditrack.com/msp" peer0.logistic1.meditrack.com peer channel update -f /etc/hyperledger/configtx/logistic1MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logistic2.meditrack.com/msp" peer0.logistic2.meditrack.com peer channel update -f /etc/hyperledger/configtx/logistic2MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmacy1.meditrack.com/msp" peer0.pharmacy1.meditrack.com peer channel update -f /etc/hyperledger/configtx/pharmacy1MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmacy2.meditrack.com/msp" peer0.pharmacy2.meditrack.com peer channel update -f /etc/hyperledger/configtx/pharmacy2MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia1.meditrack.com/msp" peer0.ia1.meditrack.com peer channel update -f /etc/hyperledger/configtx/ia1MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia2.meditrack.com/msp" peer0.ia2.meditrack.com peer channel update -f /etc/hyperledger/configtx/ia2MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
}

function clean_it() {
docker-compose -f docker-compose.yml down -v
}

function start_network() {
docker-compose -f docker-compose.yml up -d && docker ps
}

function meditrack_Channel(){
mkdir channel-artifacts/meditrack
export CHANNEL_NAME=meditrack
export FABRIC_CFG_PATH=$PWD
./configtxgen -profile meditrackChannel -outputCreateChannelTx ./channel-artifacts/meditrack/channel.tx   -channelID meditrack
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/manuf1MSPanchors.tx -channelID meditrack -asOrg manuf1
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/distr1MSPanchors.tx -channelID meditrack -asOrg distr1
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/logistic1MSPanchors.tx -channelID meditrack -asOrg logistic1
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/pharmacy1MSPanchors.tx -channelID meditrack -asOrg pharmacy1
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/ia1MSPanchors.tx -channelID meditrack -asOrg ia1
}

function join_meditrack(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c meditrack -f /etc/hyperledger/configtx/meditrack/channel.tx
docker exec peer0.manuf1.meditrack.com cp meditrack.block /etc/hyperledger/configtx/meditrack
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@distr1.meditrack.com/msp" peer0.distr1.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logistic1.meditrack.com/msp" peer0.logistic1.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmacy1.meditrack.com/msp" peer0.pharmacy1.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia1.meditrack.com/msp" peer0.ia1.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
}

function update_meditrackAnchorpeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/manuf1MSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@distr1.meditrack.com/msp" peer0.distr1.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/distr1MSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logistic1.meditrack.com/msp" peer0.logistic1.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/logistic1MSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmacy1.meditrack.com/msp" peer0.pharmacy1.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/pharmacy1MSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia1.meditrack.com/msp" peer0.ia1.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/ia1MSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
}

function agritrack_Channel(){
mkdir channel-artifacts/agritrack
export CHANNEL_NAME=agritrack
export FABRIC_CFG_PATH=$PWD
./configtxgen -profile agritrackChannel -outputCreateChannelTx ./channel-artifacts/agritrack/channel.tx   -channelID agritrack
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/manuf1MSPanchors.tx -channelID agritrack -asOrg manuf1
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/manuf2MSPanchors.tx -channelID agritrack -asOrg manuf2
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/distr2MSPanchors.tx -channelID agritrack -asOrg distr2
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/logistic2MSPanchors.tx -channelID agritrack -asOrg logistic2
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/pharmacy2MSPanchors.tx -channelID agritrack -asOrg pharmacy2
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/ia2MSPanchors.tx -channelID agritrack -asOrg ia2
}

function join_agritrack(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c agritrack -f /etc/hyperledger/configtx/agritrack/channel.tx
docker exec peer0.manuf1.meditrack.com cp agritrack.block /etc/hyperledger/configtx/agritrack
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf2.meditrack.com/msp" peer0.manuf2.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@distr2.meditrack.com/msp" peer0.distr2.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logistic2.meditrack.com/msp" peer0.logistic2.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmacy2.meditrack.com/msp" peer0.pharmacy2.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia2.meditrack.com/msp" peer0.ia2.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
}

function update_agritrackAnchorpeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/manuf1MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf2.meditrack.com/msp" peer0.manuf2.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/manuf2MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@distr2.meditrack.com/msp" peer0.distr2.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/distr2MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logistic2.meditrack.com/msp" peer0.logistic2.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/logistic2MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmacy2.meditrack.com/msp" peer0.pharmacy2.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/pharmacy2MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia2.meditrack.com/msp" peer0.ia2.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/ia2MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
}

function install_chaincode_meditrack(){
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@distr1.meditrack.com/msp" peer0.distr1.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmacy1.meditrack.com/msp" peer0.pharmacy1.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logistic1.meditrack.com/msp" peer0.logistic1.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia1.meditrack.com/msp" peer0.ia1.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
}
function instantiate_chaincode_meditrack(){
    docker cp ./privatedataConfig/privateDataCollectionMeditrack.json peer0.manuf1.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer chaincode instantiate -l node -o orderer.meditrack.com:7050 -C meditrack -n test4 -v v0 -c '{"Args":["init"]}' --collections-config privateDataCollectionMeditrack.json
}

if [ "$1" == "-r" ]
then
    echo "removing and genrating new crypto and channel artifacts"
    rm -rf crypto-config/*
    rm -rf channel-artifacts/*
    clean_it
    gen_needed
    
else
    echo "using the existing crypto folders"
    clean_it
fi

start_network
sleep 20
join_channel
update_anchorPeers
meditrack_Channel
join_meditrack
update_meditrackAnchorpeers
agritrack_Channel
join_agritrack
update_agritrackAnchorpeers
install_chaincode_meditrack
instantiate_chaincode_meditrack

function install_chain_agritrack(){
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@distr2.meditrack.com/msp" peer0.distr2.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf2.meditrack.com/msp" peer0.manuf2.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia2.meditrack.com/msp" peer0.ia2.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logistic2.meditrack.com/msp" peer0.logistic2.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmacy2.meditrack.com/msp" peer0.pharmacy2.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
}

function instantiate_chaincode_agritrack(){
    docker cp ./privatedataConfig/privateDataCollectionAgritrack.json peer0.manuf1.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manuf1.meditrack.com/msp" peer0.manuf1.meditrack.com peer chaincode instantiate -l node -o orderer.meditrack.com:7050 -C agritrack -n test6 -v v1 -c '{"Args":["init"]}' --collections-config privateDataCollectionAgritrack.json
}

install_chain_agritrack
instantiate_chaincode_agritrack