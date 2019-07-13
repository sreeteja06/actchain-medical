#!/bin/bash

function gen_needed(){
mkdir channel-artifacts
export CHANNEL_NAME=ourchannel
export FABRIC_CFG_PATH=$PWD
./cryptogen generate --config=./crypto-config.yaml
./configtxgen -profile ProfileTest -outputBlock ./channel-artifacts/genesis.block
./configtxgen -profile ChannelTest -outputCreateChannelTx ./channel-artifacts/channel.tx   -channelID ourchannel
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/ciplaMSPanchors.tx -channelID ourchannel -asOrg cipla
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/drreddyMSPanchors.tx -channelID ourchannel -asOrg drreddy
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/dtdcMSPanchors.tx -channelID ourchannel -asOrg dtdc
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/bluedartMSPanchors.tx -channelID ourchannel -asOrg bluedart
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/emcureMSPanchors.tx -channelID ourchannel -asOrg emcure
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/pharmdealMSPanchors.tx -channelID ourchannel -asOrg pharmdeal
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/apolloMSPanchors.tx -channelID ourchannel -asOrg apollo
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/medplusMSPanchors.tx -channelID ourchannel -asOrg medplus
}


function join_channel() {
docker exec peer0.cipla.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c ourchannel -f /etc/hyperledger/configtx/channel.tx
docker exec peer0.cipla.meditrack.com cp ourchannel.block /etc/hyperledger/configtx
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cipla.meditrack.com/msp" peer0.cipla.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cipla.meditrack.com/msp" peer1.cipla.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@drreddy.meditrack.com/msp" peer0.drreddy.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@drreddy.meditrack.com/msp" peer1.drreddy.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dtdc.meditrack.com/msp" peer0.dtdc.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dtdc.meditrack.com/msp" peer1.dtdc.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bluedart.meditrack.com/msp" peer0.bluedart.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bluedart.meditrack.com/msp" peer1.bluedart.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@emcure.meditrack.com/msp" peer0.emcure.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@emcure.meditrack.com/msp" peer1.emcure.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmdeal.meditrack.com/msp" peer0.pharmdeal.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@pharmdeal.meditrack.com/msp" peer1.pharmdeal.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@apollo.meditrack.com/msp" peer0.apollo.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@apollo.meditrack.com/msp" peer1.apollo.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@medplus.meditrack.com/msp" peer0.medplus.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@medplus.meditrack.com/msp" peer1.medplus.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
}

function clean_it() {
docker rm -f $(docker ps -a -q)
rm -rf crypto-config/*
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