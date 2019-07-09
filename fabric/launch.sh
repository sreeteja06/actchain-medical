#!/bin/bash

function gen_needed(){
mkdir channel-artifacts
export CHANNEL_NAME=ourchannel
export FABRIC_CFG_PATH=$PWD
# ./cryptogen generate --config=./crypto-config.yaml
./configtxgen -profile ProfileTest -outputBlock ./channel-artifacts/genesis.block
./configtxgen -profile ChannelTest -outputCreateChannelTx ./channel-artifacts/channel.tx  -channelID ourchannel
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/manuMSPanchors.tx -channelID ourchannel -asOrg manu
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/logiMSPanchors.tx -channelID ourchannel -asOrg logi
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/distMSPanchors.tx -channelID ourchannel -asOrg dist
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/pharMSPanchors.tx -channelID ourchannel -asOrg phar
}


function join_channel() {
docker exec peer0.manu.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c ourchannel -f /etc/hyperledger/configtx/channel.tx
docker exec peer0.manu.meditrack.com cp ourchannel.block /etc/hyperledger/configtx
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu.meditrack.com/msp" peer0.manu.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi.meditrack.com/msp" peer0.logi.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist.meditrack.com/msp" peer0.dist.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar.meditrack.com/msp" peer0.phar.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
}

function clean_it() {
docker rm -f $(docker ps -a -q)
# rm -rf crypto-config/*
rm -rf channel-artifacts/*
}

function start_network() {
docker-compose -f docker-compose.yml up -d && docker ps
}

clean_it
gen_needed
start_network
sleep 20
join_channel

function install_chaincode(){
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu.meditrack.com/msp" peer0.manu.meditrack.com peer chaincode install -l node -n exam1 -p /etc/hyperledger/chaincode/ -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi.meditrack.com/msp" peer0.logi.meditrack.com peer chaincode install -l node -n exam1 -p /etc/hyperledger/chaincode/ -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar.meditrack.com/msp" peer0.phar.meditrack.com peer chaincode install -l node -n exam1 -p /etc/hyperledger/chaincode/ -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist.meditrack.com/msp" peer0.dist.meditrack.com peer chaincode install -l node -n exam1 -p /etc/hyperledger/chaincode/ -v v0
}

function instantiate_chaincode(){
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu.meditrack.com/msp" peer0.manu.meditrack.com peer chaincode instantiate -l node -o orderer.meditrack.com:7050 -C ourchannel -n exam1 -v v0 -c '{"Args":["init"]}'
}

function queryChaincode(){
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu.meditrack.com/msp" peer0.manu.meditrack.com peer chaincode query -C ourchannel -n exam1 -c '{"Args":["getChannelID"]}'
}

function checkInstantiated(){
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu.meditrack.com/msp" peer0.manu.meditrack.com peer chaincode -C ourchannel list --instantiated
}

function checkPortStatus(){
    netstat -lnptu| grep 7051
}