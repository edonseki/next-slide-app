const express = require('express');
const router = express.Router();
const RoomManagerInstance = require('../common/utility/room-manager');
const uidGenerator = require('uid');
const { jwtSign } = require('../common/security/cryptor');
const { clientIpAddress } = require('../common/utility/ip-address');
const { extractTokenOrFail } = require('../common/security/room-security');

router.get('/rooms', function(req, res, next) {
  res.send(RoomManagerInstance.getRooms());
});

router.get("/commands", function(req, res, next) {
  const tokenData = extractTokenOrFail(req, res);
  if(!tokenData){
    res.sendStatus(404);
    return;
  }

  const room = RoomManagerInstance.getRoom(tokenData.data.roomId);

  res.statusCode=200;
  res.send({
    status: 'OK', 
    commands: RoomManagerInstance.pullCommands(tokenData.data.roomId),
    clients: room.clients
  });
});

router.delete("/room", function(req, res) {
  const tokenData = extractTokenOrFail(req, res);
  if(!tokenData){
    res.sendStatus(404);
    return;
  }

  RoomManagerInstance.deleteRoom(tokenData.data.roomId);
  res.statusCode=200;
  res.send({status: 'OK'});
});

router.post("/presentation-details",function(req, res, next) {
  const tokenData = extractTokenOrFail(req, res);
  if(!tokenData){
    res.sendStatus(404);
    return;
  }

  if(RoomManagerInstance.updatePresentationDetails(tokenData.data.roomId, req.body, uidGenerator.uid(14))){
    res.statusCode=200;
    res.send({status: 'OK'});
  }else{
    res.statusCode=200;
    res.send({status: 'NOK'});
  }
});

router.post('/room', function(req, res, next) {
  const roomId = uidGenerator.uid(14);
  const creatorId = uidGenerator.uid(14);
  const joinToken = uidGenerator.uid(14);

  const hostToken = jwtSign({
    role: "host",
    clientId: creatorId,
    roomId:roomId,
    joinToken:joinToken,
    clientIpAddress: clientIpAddress (req),
    date: Date.now()
  });

  if(RoomManagerInstance.createRoom(roomId, creatorId, joinToken)){
    res.statusCode=200;
    res.send({status: 'OK', roomId: roomId, creatorId: creatorId, joinToken: joinToken, hostToken: hostToken});
  }else{
    res.statusCode=500;
    res.send({status: 'NOK'});
  }
});

module.exports = router;
