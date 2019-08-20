#!/bin/bash

function gen_needed(){
mkdir channel-artifacts
export CHANNEL_NAME=ourchannel
export FABRIC_CFG_PATH=$PWD
./cryptogen generate --config=./crypto-config.yaml
./configtxgen -profile ProfileTest -outputBlock ./channel-artifacts/genesis.block
./configtxgen -profile ChannelTest -outputCreateChannelTx ./channel-artifacts/channel.tx   -channelID ourchannel
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/manu1MSPanchors.tx -channelID ourchannel -asOrg manu1
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/manu2MSPanchors.tx -channelID ourchannel -asOrg manu2
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/dist1MSPanchors.tx -channelID ourchannel -asOrg dist1
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/dist2MSPanchors.tx -channelID ourchannel -asOrg dist2
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/logi1MSPanchors.tx -channelID ourchannel -asOrg logi1
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/logi2MSPanchors.tx -channelID ourchannel -asOrg logi2
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/phar1MSPanchors.tx -channelID ourchannel -asOrg phar1
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/phar2MSPanchors.tx -channelID ourchannel -asOrg phar2
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/ia1MSPanchors.tx -channelID ourchannel -asOrg ia1
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/ia2MSPanchors.tx -channelID ourchannel -asOrg ia2
}


function join_channel() {
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c ourchannel -f /etc/hyperledger/configtx/channel.tx
docker exec peer0.manu1.meditrack.com cp ourchannel.block /etc/hyperledger/configtx
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu2.meditrack.com/msp" peer0.manu2.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist1.meditrack.com/msp" peer0.dist1.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist2.meditrack.com/msp" peer0.dist2.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi1.meditrack.com/msp" peer0.logi1.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi2.meditrack.com/msp" peer0.logi2.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar1.meditrack.com/msp" peer0.phar1.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar2.meditrack.com/msp" peer0.phar2.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia1.meditrack.com/msp" peer0.ia1.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia2.meditrack.com/msp" peer0.ia2.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
}

function update_anchorPeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer channel update -f /etc/hyperledger/configtx/manu1MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu2.meditrack.com/msp" peer0.manu2.meditrack.com peer channel update -f /etc/hyperledger/configtx/manu2MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist1.meditrack.com/msp" peer0.dist1.meditrack.com peer channel update -f /etc/hyperledger/configtx/dist1MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist2.meditrack.com/msp" peer0.dist2.meditrack.com peer channel update -f /etc/hyperledger/configtx/dist2MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi1.meditrack.com/msp" peer0.logi1.meditrack.com peer channel update -f /etc/hyperledger/configtx/logi1MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi2.meditrack.com/msp" peer0.logi2.meditrack.com peer channel update -f /etc/hyperledger/configtx/logi2MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar1.meditrack.com/msp" peer0.phar1.meditrack.com peer channel update -f /etc/hyperledger/configtx/phar1MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar2.meditrack.com/msp" peer0.phar2.meditrack.com peer channel update -f /etc/hyperledger/configtx/phar2MSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
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
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/manu1MSPanchors.tx -channelID meditrack -asOrg manu1
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/dist1MSPanchors.tx -channelID meditrack -asOrg dist1
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/logi1MSPanchors.tx -channelID meditrack -asOrg logi1
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/phar1MSPanchors.tx -channelID meditrack -asOrg phar1
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/ia1MSPanchors.tx -channelID meditrack -asOrg ia1
}

function join_meditrack(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c meditrack -f /etc/hyperledger/configtx/meditrack/channel.tx
docker exec peer0.manu1.meditrack.com cp meditrack.block /etc/hyperledger/configtx/meditrack
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist1.meditrack.com/msp" peer0.dist1.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi1.meditrack.com/msp" peer0.logi1.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar1.meditrack.com/msp" peer0.phar1.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia1.meditrack.com/msp" peer0.ia1.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
}

function update_meditrackAnchorpeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/manu1MSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist1.meditrack.com/msp" peer0.dist1.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/dist1MSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi1.meditrack.com/msp" peer0.logi1.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/logi1MSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar1.meditrack.com/msp" peer0.phar1.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/phar1MSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia1.meditrack.com/msp" peer0.ia1.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/ia1MSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
}

function agritrack_Channel(){
mkdir channel-artifacts/agritrack
export CHANNEL_NAME=agritrack
export FABRIC_CFG_PATH=$PWD
./configtxgen -profile agritrackChannel -outputCreateChannelTx ./channel-artifacts/agritrack/channel.tx   -channelID agritrack
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/manu1MSPanchors.tx -channelID agritrack -asOrg manu1
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/manu2MSPanchors.tx -channelID agritrack -asOrg manu2
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/dist2MSPanchors.tx -channelID agritrack -asOrg dist2
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/logi2MSPanchors.tx -channelID agritrack -asOrg logi2
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/phar2MSPanchors.tx -channelID agritrack -asOrg phar2
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/ia2MSPanchors.tx -channelID agritrack -asOrg ia2
}

function join_agritrack(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c agritrack -f /etc/hyperledger/configtx/agritrack/channel.tx
docker exec peer0.manu1.meditrack.com cp agritrack.block /etc/hyperledger/configtx/agritrack
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu2.meditrack.com/msp" peer0.manu2.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist2.meditrack.com/msp" peer0.dist2.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi2.meditrack.com/msp" peer0.logi2.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar2.meditrack.com/msp" peer0.phar2.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia2.meditrack.com/msp" peer0.ia2.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
}

function update_agritrackAnchorpeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/manu1MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu2.meditrack.com/msp" peer0.manu2.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/manu2MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist2.meditrack.com/msp" peer0.dist2.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/dist2MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi2.meditrack.com/msp" peer0.logi2.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/logi2MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar2.meditrack.com/msp" peer0.phar2.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/phar2MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia2.meditrack.com/msp" peer0.ia2.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/ia2MSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
}

function install_chaincode_meditrack(){
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist1.meditrack.com/msp" peer0.dist1.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar1.meditrack.com/msp" peer0.phar1.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi1.meditrack.com/msp" peer0.logi1.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia1.meditrack.com/msp" peer0.ia1.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
}
function instantiate_chaincode_meditrack(){
    docker cp ./privatedataConfig/privateDataCollectionMeditrack.json peer0.manu1.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer chaincode instantiate -l node -o orderer.meditrack.com:7050 -C meditrack -n test4 -v v0 -c '{"Args":["init"]}' --collections-config privateDataCollectionMeditrack.json
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
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist2.meditrack.com/msp" peer0.dist2.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu2.meditrack.com/msp" peer0.manu2.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@ia2.meditrack.com/msp" peer0.ia2.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi2.meditrack.com/msp" peer0.logi2.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar2.meditrack.com/msp" peer0.phar2.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
}

function instantiate_chaincode_agritrack(){
    docker cp ./privatedataConfig/privateDataCollectionAgritrack.json peer0.manu1.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu1.meditrack.com/msp" peer0.manu1.meditrack.com peer chaincode instantiate -l node -o orderer.meditrack.com:7050 -C agritrack -n test6 -v v1 -c '{"Args":["init"]}' --collections-config privateDataCollectionAgritrack.json
}

install_chain_agritrack
instantiate_chaincode_agritrack