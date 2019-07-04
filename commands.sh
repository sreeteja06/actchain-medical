#---- enroll an admin for a organization -----

fabric-ca-client enroll \
-u https://mediTrack:mediTrack123@ca.m-x3z64f6rhrad7c534dw3dmibhy.n-mpl3ejibsfgi3d2sbonw2a6cfu.managedblockchain.us-east-1.amazonaws.com:30005 \
--tls.certfiles /home/ec2-user/managedblockchain-tls-chain.pem -M /home/ec2-user/admin-Distributor-msp

cp -r admin-Distributor-msp/signcerts admin-Distributor-msp/admincerts

#----- up the docker container ----
docker-compose -f docker-compose-cli.yaml up -d

emacs ~/.bash_profile
#---- assign variables ----
export MSPDISTRO=m-X3Z64F6RHRAD7C534DW3DMIBHY
export MSP_PATHDISTRO=/opt/home/dist-admin-msp
export PEERDISTRO=nd-DVYUSDSXTJGCFBT2BEBBTDO7AY


#---- install chaincode on peer -----
docker exec -e "CORE_PEER_TLS_ENABLED=true" \
-e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
-e "CORE_PEER_LOCALMSPID=$MSPDISTRO" \
-e "CORE_PEER_MSPCONFIGPATH=$MSP_PATHDISTRO" \
-e "CORE_PEER_ADDRESS=$PEERDISTRO" \
cli peer chaincode install \
-l node -n medical-contract -v v0 -p /opt/gopath/src/github.com/medical

#---- check instantiated chaincodes -----
docker exec cli peer chaincode list -C mychannel --instantiated

#--- check the peers in the organization
aws managedblockchain get-member \
--network-id n-MPL3EJIBSFGI3D2SBONW2A6CFU \
--member-id $MSPDISTRO

GET /networks/n-MPL3EJIBSFGI3D2SBONW2A6CFU/members/m-X3Z64F6RHRAD7C534DW3DMIBHY HTTP/1.1

#--- scp commad
scp -i MediTrack-v2.pem /home/sree/Documents/projects/hyperledgerPro/actchain-medical/frontend/app.js ec2-user@ec2-3-81-170-231.compute-1.amazonaws.com:/home/ec2-user/actchain-medical/frontend

#---- create configtx peer block after writing the configtx.yaml----
docker exec cli configtxgen \
-outputCreateChannelTx /opt/home/ourchannel.pb \
-profile TwoOrgChannel -channelID ourchannel \
--configPath /opt/home/

#---- create the channel ----
docker exec -e "CORE_PEER_TLS_ENABLED=true" \
-e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
-e "CORE_PEER_ADDRESS=$PEER" \
-e "CORE_PEER_LOCALMSPID=$MSP" \
-e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" \
cli peer channel create -c ourchannel \
-f /opt/home/ourchannel.pb -o $ORDERER --cafile /opt/home/managedblockchain-tls-chain.pem --tls

#create channel using Other organization
docker exec clidistro configtxgen \
-outputCreateChannelTx /opt/home/distrochannel.pb \
-profile TwoOrgChannel -channelID distrochannel \
--configPath /opt/home/


docker exec -e "CORE_PEER_TLS_ENABLED=true" \
-e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
-e "CORE_PEER_ADDRESS=$PEERDISTRO" \
-e "CORE_PEER_LOCALMSPID=$MSPDISTRO" \
-e "CORE_PEER_MSPCONFIGPATH=$MSP_PATHDISTRO" \
clidistro peer channel create -c distrochannel \
-f /opt/home/distrochannel.pb -o $ORDERER --cafile /opt/home/managedblockchain-tls-chain.pem --tls


#---- get channel genesis block ------

docker exec -e "CORE_PEER_TLS_ENABLED=true" \
-e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
-e "CORE_PEER_ADDRESS=$PEER" \
-e "CORE_PEER_LOCALMSPID=$MSP" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" \
cli peer channel fetch oldest /opt/home/ourchannel.block \
-c ourchannel -o $ORDERER \
--cafile /opt/home/managedblockchain-tls-chain.pem --tls


#---- peer 1 from org1 join ----

docker exec -e "CORE_PEER_TLS_ENABLED=true" \
-e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
-e "CORE_PEER_ADDRESS=$PEER" \
-e "CORE_PEER_LOCALMSPID=$MSP" \
-e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" \
cli peer channel join -b /opt/home/ourchannel.block \
-o $ORDERER --cafile /opt/home/managedblockchain-tls-chain.pem --tls

#---- get channel genesis block  for peer 2------

docker exec -e "CORE_PEER_TLS_ENABLED=true" \
-e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
-e "CORE_PEER_ADDRESS=$PEERDISTRO" \
-e "CORE_PEER_LOCALMSPID=$MSPDISTRO" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATHDISTRO" \
clidistro peer channel fetch oldest /opt/home/ourchannel.block \
-c ourchannel -o $ORDERER \
--cafile /opt/home/managedblockchain-tls-chain.pem --tls

#--- peer2 from org2 join network ----

docker exec -e "CORE_PEER_TLS_ENABLED=true" \
-e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
-e "CORE_PEER_ADDRESS=$PEERDISTRO" \
-e "CORE_PEER_LOCALMSPID=$MSPDISTRO" \
-e "CORE_PEER_MSPCONFIGPATH=$MSP_PATHDISTRO" \
clidistro peer channel join -b /opt/home/ourchannel.block \
-o $ORDERER --cafile /opt/home/managedblockchain-tls-chain.pem --tls
