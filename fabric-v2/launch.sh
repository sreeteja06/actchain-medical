#!/bin/bash

function gen_needed(){
mkdir channel-artifacts
export CHANNEL_NAME=ourchannel
export FABRIC_CFG_PATH=$PWD
./cryptogen generate --config=./crypto-config.yaml
./configtxgen -profile ProfileTest -outputBlock ./channel-artifacts/genesis.block
./configtxgen -profile ChannelTest -outputCreateChannelTx ./channel-artifacts/channel.tx   -channelID ourchannel
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/bayerMSPanchors.tx -channelID ourchannel -asOrg bayer
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/aimcoMSPanchors.tx -channelID ourchannel -asOrg aimco
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/gaiaMSPanchors.tx -channelID ourchannel -asOrg gaia
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/migrowMSPanchors.tx -channelID ourchannel -asOrg migrow
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/fedxMSPanchors.tx -channelID ourchannel -asOrg fedx
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/dtdcMSPanchors.tx -channelID ourchannel -asOrg dtdc
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/apolloMSPanchors.tx -channelID ourchannel -asOrg apollo
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/careMSPanchors.tx -channelID ourchannel -asOrg care
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/cdscoMSPanchors.tx -channelID ourchannel -asOrg cdsco
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/cibrcMSPanchors.tx -channelID ourchannel -asOrg cibrc
}


function join_channel() {
docker exec peer0.bayer.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c ourchannel -f /etc/hyperledger/configtx/channel.tx
docker exec peer0.bayer.meditrack.com cp ourchannel.block /etc/hyperledger/configtx
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bayer.meditrack.com/msp" peer0.bayer.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@aimco.meditrack.com/msp" peer0.aimco.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@gaia.meditrack.com/msp" peer0.gaia.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@migrow.meditrack.com/msp" peer0.migrow.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@fedx.meditrack.com/msp" peer0.fedx.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dtdc.meditrack.com/msp" peer0.dtdc.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@apollo.meditrack.com/msp" peer0.apollo.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@care.meditrack.com/msp" peer0.care.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cdsco.meditrack.com/msp" peer0.cdsco.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cibrc.meditrack.com/msp" peer0.cibrc.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
}

function update_anchorPeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bayer.meditrack.com/msp" peer0.bayer.meditrack.com peer channel update -f /etc/hyperledger/configtx/bayerMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@aimco.meditrack.com/msp" peer0.aimco.meditrack.com peer channel update -f /etc/hyperledger/configtx/aimcoMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@gaia.meditrack.com/msp" peer0.gaia.meditrack.com peer channel update -f /etc/hyperledger/configtx/gaiaMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@migrow.meditrack.com/msp" peer0.migrow.meditrack.com peer channel update -f /etc/hyperledger/configtx/migrowMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@fedx.meditrack.com/msp" peer0.fedx.meditrack.com peer channel update -f /etc/hyperledger/configtx/fedxMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dtdc.meditrack.com/msp" peer0.dtdc.meditrack.com peer channel update -f /etc/hyperledger/configtx/dtdcMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@apollo.meditrack.com/msp" peer0.apollo.meditrack.com peer channel update -f /etc/hyperledger/configtx/apolloMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@care.meditrack.com/msp" peer0.care.meditrack.com peer channel update -f /etc/hyperledger/configtx/careMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cdsco.meditrack.com/msp" peer0.cdsco.meditrack.com peer channel update -f /etc/hyperledger/configtx/cdscoMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cibrc.meditrack.com/msp" peer0.cibrc.meditrack.com peer channel update -f /etc/hyperledger/configtx/cibrcMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
}

function clean_it() {
docker rm -f $(docker ps -a -q)
rm -rf crypto-config/*
rm -rf channel-artifacts/*
}

function start_network() {
docker-compose -f docker-compose.yml up -d && docker ps
}

function meditrack_Channel(){
mkdir channel-artifacts/meditrack
export CHANNEL_NAME=meditrack
export FABRIC_CFG_PATH=$PWD
./configtxgen -profile meditrackChannel -outputCreateChannelTx ./channel-artifacts/meditrack/channel.tx   -channelID meditrack
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/bayerMSPanchors.tx -channelID meditrack -asOrg bayer
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/gaiaMSPanchors.tx -channelID meditrack -asOrg gaia
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/fedxMSPanchors.tx -channelID meditrack -asOrg fedx
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/apolloMSPanchors.tx -channelID meditrack -asOrg apollo
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/cdscoMSPanchors.tx -channelID meditrack -asOrg cdsco
}

function join_meditrack(){
docker exec peer0.bayer.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c meditrack -f /etc/hyperledger/configtx/meditrack/channel.tx
docker exec peer0.bayer.meditrack.com cp meditrack.block /etc/hyperledger/configtx/meditrack
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bayer.meditrack.com/msp" peer0.bayer.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@gaia.meditrack.com/msp" peer0.gaia.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@fedx.meditrack.com/msp" peer0.fedx.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@apollo.meditrack.com/msp" peer0.apollo.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cdsco.meditrack.com/msp" peer0.cdsco.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
}

function update_meditrackAnchorpeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bayer.meditrack.com/msp" peer0.bayer.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/bayerMSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@gaia.meditrack.com/msp" peer0.gaia.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/gaiaMSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@fedx.meditrack.com/msp" peer0.fedx.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/fedxMSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@apollo.meditrack.com/msp" peer0.apollo.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/apolloMSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cdsco.meditrack.com/msp" peer0.cdsco.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/cdscoMSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
}

function agritrack_Channel(){
mkdir channel-artifacts/agritrack
export CHANNEL_NAME=agritrack
export FABRIC_CFG_PATH=$PWD
./configtxgen -profile agritrackChannel -outputCreateChannelTx ./channel-artifacts/agritrack/channel.tx   -channelID agritrack
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/bayerMSPanchors.tx -channelID agritrack -asOrg bayer
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/aimcoMSPanchors.tx -channelID agritrack -asOrg aimco
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/migrowMSPanchors.tx -channelID agritrack -asOrg migrow
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/dtdcMSPanchors.tx -channelID agritrack -asOrg dtdc
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/careMSPanchors.tx -channelID agritrack -asOrg care
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/cibrcMSPanchors.tx -channelID agritrack -asOrg cibrc
}

function join_agritrack(){
docker exec peer0.bayer.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c agritrack -f /etc/hyperledger/configtx/agritrack/channel.tx
docker exec peer0.bayer.meditrack.com cp agritrack.block /etc/hyperledger/configtx/agritrack
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bayer.meditrack.com/msp" peer0.bayer.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@aimco.meditrack.com/msp" peer0.aimco.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@migrow.meditrack.com/msp" peer0.migrow.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dtdc.meditrack.com/msp" peer0.dtdc.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@care.meditrack.com/msp" peer0.care.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cibrc.meditrack.com/msp" peer0.cibrc.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
}

function update_agritrackAnchorpeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bayer.meditrack.com/msp" peer0.bayer.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/bayerMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@aimco.meditrack.com/msp" peer0.aimco.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/aimcoMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@migrow.meditrack.com/msp" peer0.migrow.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/migrowMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dtdc.meditrack.com/msp" peer0.dtdc.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/dtdcMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@care.meditrack.com/msp" peer0.care.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/careMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cibrc.meditrack.com/msp" peer0.cibrc.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/cibrcMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
}

clean_it
gen_needed
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

function install_chaincode(){
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bayer.meditrack.com/msp" peer0.bayer.meditrack.com peer chaincode install -l node -n test3 -p /etc/hyperledger/chaincode/meditrack -v v0
}

function instantiate_chaincode(){
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bayer.meditrack.com/msp" peer0.bayer.meditrack.com peer chaincode instantiate -l node -o orderer.meditrack.com:7050 -C ourchannel -n test3 -v v0 -c '{"Args":["init"]}'
}syste	
