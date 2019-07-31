#!/bin/bash

function gen_needed(){
mkdir channel-artifacts
export CHANNEL_NAME=ourchannel
export FABRIC_CFG_PATH=$PWD
./cryptogen generate --config=./crypto-config.yaml
./configtxgen -profile ProfileTest -outputBlock ./channel-artifacts/genesis.block
./configtxgen -profile ChannelTest -outputCreateChannelTx ./channel-artifacts/channel.tx   -channelID ourchannel
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/mayerMSPanchors.tx -channelID ourchannel -asOrg mayer
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/aimkoMSPanchors.tx -channelID ourchannel -asOrg aimko
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/baiaMSPanchors.tx -channelID ourchannel -asOrg baia
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/bigrowMSPanchors.tx -channelID ourchannel -asOrg bigrow
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/dedxMSPanchors.tx -channelID ourchannel -asOrg dedx
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/btdcMSPanchors.tx -channelID ourchannel -asOrg btdc
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/abolloMSPanchors.tx -channelID ourchannel -asOrg abollo
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/fareMSPanchors.tx -channelID ourchannel -asOrg fare
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/cdscoMSPanchors.tx -channelID ourchannel -asOrg cdsco
./configtxgen -profile ChannelTest -outputAnchorPeersUpdate ./channel-artifacts/cibrcMSPanchors.tx -channelID ourchannel -asOrg cibrc
}


function join_channel() {
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c ourchannel -f /etc/hyperledger/configtx/channel.tx
docker exec peer0.mayer.meditrack.com cp ourchannel.block /etc/hyperledger/configtx
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@aimko.meditrack.com/msp" peer0.aimko.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@baia.meditrack.com/msp" peer0.baia.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bigrow.meditrack.com/msp" peer0.bigrow.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dedx.meditrack.com/msp" peer0.dedx.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@btdc.meditrack.com/msp" peer0.btdc.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@abollo.meditrack.com/msp" peer0.abollo.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@fare.meditrack.com/msp" peer0.fare.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cdsco.meditrack.com/msp" peer0.cdsco.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cibrc.meditrack.com/msp" peer0.cibrc.meditrack.com peer channel join -b /etc/hyperledger/configtx/ourchannel.block
}

function update_anchorPeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer channel update -f /etc/hyperledger/configtx/mayerMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@aimko.meditrack.com/msp" peer0.aimko.meditrack.com peer channel update -f /etc/hyperledger/configtx/aimkoMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@baia.meditrack.com/msp" peer0.baia.meditrack.com peer channel update -f /etc/hyperledger/configtx/baiaMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bigrow.meditrack.com/msp" peer0.bigrow.meditrack.com peer channel update -f /etc/hyperledger/configtx/bigrowMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dedx.meditrack.com/msp" peer0.dedx.meditrack.com peer channel update -f /etc/hyperledger/configtx/dedxMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@btdc.meditrack.com/msp" peer0.btdc.meditrack.com peer channel update -f /etc/hyperledger/configtx/btdcMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@abollo.meditrack.com/msp" peer0.abollo.meditrack.com peer channel update -f /etc/hyperledger/configtx/abolloMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@fare.meditrack.com/msp" peer0.fare.meditrack.com peer channel update -f /etc/hyperledger/configtx/fareMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cdsco.meditrack.com/msp" peer0.cdsco.meditrack.com peer channel update -f /etc/hyperledger/configtx/cdscoMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cibrc.meditrack.com/msp" peer0.cibrc.meditrack.com peer channel update -f /etc/hyperledger/configtx/cibrcMSPanchors.tx -c ourchannel -o orderer.meditrack.com:7050
}

function clean_it() {
docker-compose -f docker-compose.yml down -v
# rm -rf crypto-config/*
# rm -rf channel-artifacts/*
}

function start_network() {
docker-compose -f docker-compose.yml up -d && docker ps
}

function meditrack_Channel(){
mkdir channel-artifacts/meditrack
export CHANNEL_NAME=meditrack
export FABRIC_CFG_PATH=$PWD
./configtxgen -profile meditrackChannel -outputCreateChannelTx ./channel-artifacts/meditrack/channel.tx   -channelID meditrack
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/mayerMSPanchors.tx -channelID meditrack -asOrg mayer
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/baiaMSPanchors.tx -channelID meditrack -asOrg baia
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/dedxMSPanchors.tx -channelID meditrack -asOrg dedx
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/abolloMSPanchors.tx -channelID meditrack -asOrg abollo
./configtxgen -profile meditrackChannel -outputAnchorPeersUpdate ./channel-artifacts/meditrack/cdscoMSPanchors.tx -channelID meditrack -asOrg cdsco
}

function join_meditrack(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c meditrack -f /etc/hyperledger/configtx/meditrack/channel.tx
docker exec peer0.mayer.meditrack.com cp meditrack.block /etc/hyperledger/configtx/meditrack
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@baia.meditrack.com/msp" peer0.baia.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dedx.meditrack.com/msp" peer0.dedx.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@abollo.meditrack.com/msp" peer0.abollo.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cdsco.meditrack.com/msp" peer0.cdsco.meditrack.com peer channel join -b /etc/hyperledger/configtx/meditrack/meditrack.block
}

function update_meditrackAnchorpeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/mayerMSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@baia.meditrack.com/msp" peer0.baia.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/baiaMSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dedx.meditrack.com/msp" peer0.dedx.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/dedxMSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@abollo.meditrack.com/msp" peer0.abollo.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/abolloMSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cdsco.meditrack.com/msp" peer0.cdsco.meditrack.com peer channel update -f /etc/hyperledger/configtx/meditrack/cdscoMSPanchors.tx -c meditrack -o orderer.meditrack.com:7050
}

function agritrack_Channel(){
mkdir channel-artifacts/agritrack
export CHANNEL_NAME=agritrack
export FABRIC_CFG_PATH=$PWD
./configtxgen -profile agritrackChannel -outputCreateChannelTx ./channel-artifacts/agritrack/channel.tx   -channelID agritrack
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/mayerMSPanchors.tx -channelID agritrack -asOrg mayer
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/aimkoMSPanchors.tx -channelID agritrack -asOrg aimko
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/bigrowMSPanchors.tx -channelID agritrack -asOrg bigrow
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/btdcMSPanchors.tx -channelID agritrack -asOrg btdc
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/fareMSPanchors.tx -channelID agritrack -asOrg fare
./configtxgen -profile agritrackChannel -outputAnchorPeersUpdate ./channel-artifacts/agritrack/cibrcMSPanchors.tx -channelID agritrack -asOrg cibrc
}

function join_agritrack(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer channel create -o orderer.meditrack.com:7050 -c agritrack -f /etc/hyperledger/configtx/agritrack/channel.tx
docker exec peer0.mayer.meditrack.com cp agritrack.block /etc/hyperledger/configtx/agritrack
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@aimko.meditrack.com/msp" peer0.aimko.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bigrow.meditrack.com/msp" peer0.bigrow.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@btdc.meditrack.com/msp" peer0.btdc.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@fare.meditrack.com/msp" peer0.fare.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cibrc.meditrack.com/msp" peer0.cibrc.meditrack.com peer channel join -b /etc/hyperledger/configtx/agritrack/agritrack.block
}

function update_agritrackAnchorpeers(){
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/mayerMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@aimko.meditrack.com/msp" peer0.aimko.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/aimkoMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bigrow.meditrack.com/msp" peer0.bigrow.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/bigrowMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@btdc.meditrack.com/msp" peer0.btdc.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/btdcMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@fare.meditrack.com/msp" peer0.fare.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/fareMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cibrc.meditrack.com/msp" peer0.cibrc.meditrack.com peer channel update -f /etc/hyperledger/configtx/agritrack/cibrcMSPanchors.tx -c agritrack -o orderer.meditrack.com:7050
}

function install_chaincode_meditrack(){
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@baia.meditrack.com/msp" peer0.baia.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@abollo.meditrack.com/msp" peer0.abollo.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dedx.meditrack.com/msp" peer0.dedx.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cdsco.meditrack.com/msp" peer0.cdsco.meditrack.com peer chaincode install -l node -n test4 -p /etc/hyperledger/chaincode/meditrack -v v0
}
function instantiate_chaincode_meditrack(){
    docker cp ./privatedataConfig/privateDataCollectionMeditrack.json peer0.mayer.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer chaincode instantiate -l node -o orderer.meditrack.com:7050 -C meditrack -n test4 -v v0 -c '{"Args":["init"]}' --collections-config privateDataCollectionMeditrack.json
}

clean_it
# gen_needed
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
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@bigrow.meditrack.com/msp" peer0.bigrow.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@aimko.meditrack.com/msp" peer0.aimko.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@cibrc.meditrack.com/msp" peer0.cibrc.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@btdc.meditrack.com/msp" peer0.btdc.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@fare.meditrack.com/msp" peer0.fare.meditrack.com peer chaincode install -l node -n test6 -p /etc/hyperledger/chaincode/agritrack -v v1
}

function instantiate_chaincode_agritrack(){
    docker cp ./privatedataConfig/privateDataCollectionAgritrack.json peer0.mayer.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/
    docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@mayer.meditrack.com/msp" peer0.mayer.meditrack.com peer chaincode instantiate -l node -o orderer.meditrack.com:7050 -C agritrack -n test6 -v v1 -c '{"Args":["init"]}' --collections-config privateDataCollectionAgritrack.json
}

install_chain_agritrack
instantiate_chaincode_agritrack