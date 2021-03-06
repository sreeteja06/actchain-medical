#generate cypto-congif files for the organization
../cryptogen generate --config=./crypto-config.yaml

#nworg specific configuration material in JSON
export FABRIC_CFG_PATH=$PWD && ../configtxgen -printOrg neworgMSP > ../channel-artifacts/neworg.json

#ort the Orderer Org’s MSP material into the neworg crypto-config directory.
cd ../ && cp -r crypto-config/ordererOrganizations newOrg/crypto-config/

cd newOrg
#fetch the channel block configaration
#This command saves the binary protobuf channel configuration block to config_block.pb
docker exec peer0.manu.meditrack.com peer channel fetch config config_block.pb -o orderer.meditrack.com:7050 -c ourchannel

#get the file from the docker to the local
docker cp peer0.manu.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/config_block.pb ./

#Convert the Configuration to JSON and Trim It Down
./configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config > config.json

#Add the newOrg Crypto Material
jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"neworgMSP":.[1]}}}}}' config.json ../channel-artifacts/neworg.json > modified_config.json

#translate config.json back into a protobuf called config.pb
./configtxlator proto_encode --input config.json --type common.Config --output config.pb

#encode modified_config.json to modified_config.pb
./configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb

#use configtxlator to calculate the delta between these two config protobufs. This command will output a new protobuf binary named neworg_update.pb
./configtxlator compute_update --channel_id ourchannel --original config.pb --updated modified_config.pb --output neworg_update.pb

#This new proto – org3_update.pb – contains the Org3 definitions and high level pointers to the Org1 and Org2 material. We are able to forgo the extensive MSP material and modification policy information for Org1 and Org2 because this data is already present within the channel’s genesis block. As such, we only need the delta between the two configurations.
#Before submitting the channel update, we need to perform a few final steps. First,
#let’s decode this object neworg_update.pb into editable JSON format and call it neworg_update.json

./configtxlator proto_decode --input neworg_update.pb --type common.ConfigUpdate | jq . > neworg_update.json

#we have a decoded update file – org3_update.json – that we need to wrap in an envelope message. This step will give us back the header field that we stripped away earlier. We’ll name this file org3_update_in_envelope.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"ourchannel", "type":2}},"data":{"config_update":'$(cat neworg_update.json)'}}}' | jq . > neworg_update_in_envelope.json

#we will leverage the configtxlator tool one last time and convert it into the fully fledged protobuf format that Fabric requires. We’ll name our final update object org3_update_in_envelope.pb
./configtxlator proto_encode --input neworg_update_in_envelope.json --type common.Envelope --output neworg_update_in_envelope.pb

#copy the file to docker
docker cp ./neworg_update_in_envelope.pb peer0.manu.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/


#Sign and Submit the Config Update
#the config must be signed by multiple organizations in the channel
#The modification policy (mod_policy) for our channel Application group is set to the default of “MAJORITY”, which means that we need a majority of existing org admins to sign it. Because we have only two orgs – Org1 and Org2 – and the majority of two is two, we need both of them to sign. Without both signatures, the ordering service will reject the transaction for failing to fulfill the policy.
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu.meditrack.com/msp" peer0.manu.meditrack.com peer channel signconfigtx -f neworg_update_in_envelope.pb

docker cp peer0.manu.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/neworg_update_in_envelope.pb ./
docker cp ./neworg_update_in_envelope.pb peer0.dist.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/

docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@dist.meditrack.com/msp" peer0.dist.meditrack.com peer channel signconfigtx -f neworg_update_in_envelope.pb

docker cp peer0.dist.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/neworg_update_in_envelope.pb ./
docker cp ./neworg_update_in_envelope.pb peer0.logi.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/

docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@logi.meditrack.com/msp" peer0.logi.meditrack.com peer channel signconfigtx -f neworg_update_in_envelope.pb

docker cp peer0.logi.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/neworg_update_in_envelope.pb ./
docker cp ./neworg_update_in_envelope.pb peer0.phar.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/

docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@phar.meditrack.com/msp" peer0.phar.meditrack.com peer channel signconfigtx -f neworg_update_in_envelope.pb

docker cp peer0.phar.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/neworg_update_in_envelope.pb ./
docker cp ./neworg_update_in_envelope.pb peer0.manu.meditrack.com:/opt/gopath/src/github.com/hyperledger/fabric/


#Send the update call
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu.meditrack.com/msp" peer0.manu.meditrack.com peer channel update -f neworg_update_in_envelope.pb -c ourchannel -o orderer.meditrack.com:7050

#start the neworg containers
docker-compose -f docker-compose.yml up -d

#we are passing a 0 to indicate that we want the first block on the channel’s ledger (i.e. the genesis block). If we simply passed the peer channel fetch config command, then we would have received block 5 – the updated config with Org3 defined. However, we can’t begin our ledger with a downstream block – we must start with block 0.
docker exec peer0.neworg.meditrack.com peer channel fetch 0 ourchannel.block -o orderer.meditrack.com:7050 -c ourchannel

#Issue the peer channel join command and pass in the genesis block – mychannel.block:
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@neworg.meditrack.com/msp" peer0.neworg.meditrack.com peer channel join -b ourchannel.block

#get the channels the peer joinded
docker exec peer0.neworg.meditrack.com peer channel list

docker cp -r ../../chaincode peer0.neworg.meditrack.com:/etc/hyperledger/chaincode

#install chaincode
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@neworg.meditrack.com/msp" peer0.neworg.meditrack.com peer chaincode install -l node -n exam5 -p /etc/hyperledger/chaincode/ -v v1

#check instantiated
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@neworg.meditrack.com/msp" peer0.neworg.meditrack.com peer chaincode -C ourchannel list --instantiated

#upgrade chaincode
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@manu.meditrack.com/msp" peer0.manu.meditrack.com peer chaincode upgrade -l node -o orderer.meditrack.com:7050 -C ourchannel -n exam5 -v v1 -c '{"Args":["init"]}'

#query chiancode
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@neworg.meditrack.com/msp" peer0.neworg.meditrack.com peer chaincode query -C ourchannel -n exam5 -c '{"Args":["getChannelID"]}'