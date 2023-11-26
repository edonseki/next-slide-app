const express = require('express');
const router = express.Router();
const RoomManagerInstance = require('../common/utility/room-manager');
const { jwtSign } = require('../common/security/cryptor');
const { clientIpAddress } = require('../common/utility/ip-address');
const { extractTokenOrFail } = require('../common/security/room-security');
const uidGenerator = require('uid');

router.post('/next', function(req, res, next) {
  const tokenData = extractTokenOrFail(req, res);
  if(!tokenData){
    res.sendStatus(404);
    return;
  }

  const room = RoomManagerInstance.getRoom(tokenData.data.roomId);

  if(!room){
    res.sendStatus(404);
    return;
  }

  if(tokenData.data.clientIpAddress !== clientIpAddress (req)){
    res.sendStatus(401);
    return;
  }

  if(!RoomManagerInstance.doesClientBelongToRoom(tokenData.data.clientId, room)){
    res.sendStatus(401);
    return;
  }

  RoomManagerInstance.broadcastCommand(tokenData.data.roomId, "next");

  res.statusCode=200;
  res.send({status: 'OK'});
});

router.post('/previous', function(req, res, next) {
  const tokenData = extractTokenOrFail(req, res);
  if(!tokenData){
    res.sendStatus(404);
    return;
  }

  const room = RoomManagerInstance.getRoom(tokenData.data.roomId);

  if(!room){
    res.sendStatus(404);
    return;
  }

  if(tokenData.data.clientIpAddress !== clientIpAddress (req)){
    res.sendStatus(401);
    return;
  }

  if(!RoomManagerInstance.doesClientBelongToRoom(tokenData.data.clientId, room)){
    res.sendStatus(401);
    return;
  }

  RoomManagerInstance.broadcastCommand(tokenData.data.roomId, "previous");

  res.statusCode=200;
  res.send({status: 'OK'});
});

router.get("/details-version",function(req, res, next) {
  const tokenData = extractTokenOrFail(req, res);
  if(!tokenData){
    res.sendStatus(404);
    return;
  }

  const room = RoomManagerInstance.getRoom(tokenData.data.roomId);

  if(!room){
    res.sendStatus(404);
    return;
  }

  if(tokenData.data.clientIpAddress !== clientIpAddress (req)){
    res.sendStatus(401);
    return;
  }

  if(!RoomManagerInstance.doesClientBelongToRoom(tokenData.data.clientId, room)){
    res.sendStatus(401);
    return;
  }

  res.statusCode=200;
  res.send({status: 'OK', contentVersionId: room.presentationDetails.contentVersionId});
});

router.get('/details', function(req, res, next) {
  const tokenData = extractTokenOrFail(req, res);
  if(!tokenData){
    return;
  }

  const room = RoomManagerInstance.getRoom(tokenData.data.roomId);

  if(!room){
    res.sendStatus(404);
    return;
  }

  if(tokenData.data.clientIpAddress !== clientIpAddress (req)){
    res.sendStatus(401);
    return;
  }

  if(!RoomManagerInstance.doesClientBelongToRoom(tokenData.data.clientId, room)){
    res.sendStatus(401);
    return;
  }

  res.statusCode=200;
  res.send({status: 'OK', presentationDetails: room.presentationDetails});
});


router.post('/join/:roomId/:joinToken', function(req, res, next) {
  const roomId = req.params.roomId;
  const joinToken = req.params.joinToken;

  const room = RoomManagerInstance.getRoom(roomId);

  if(!room){
    res.sendStatus(404);
    return;
  }

  if(room.joinToken !== joinToken){
    res.sendStatus(401);
    return;
  }

  if(!req.body.username){
    res.statusCode=403;
    res.send({status: 'NOK', error: "Username required!"});
    return;
  }

  const tempClientId = uidGenerator.uid(25);

  const presentationToken = jwtSign({
    role: "guest",
    clientId: tempClientId,
    roomId:roomId,
    joinToken:joinToken,
    clientIpAddress: clientIpAddress (req),
    date: Date.now()
  });

  const joined = RoomManagerInstance.joinRoom(roomId, tempClientId, req.body.username)

  if(!joined){
    res.sendStatus(401);
    return;
  }

  res.statusCode=200;
  res.send({status: 'OK', presentationToken:presentationToken});
});

module.exports = router;
