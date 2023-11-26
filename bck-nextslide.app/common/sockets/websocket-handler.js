const WebSocket = require('ws');

class WebSocketHandler {
  wss = null;
  rooms = null;

  constructor() {
    this.rooms = {};
  }

  initiateWebSocket(server){
    if(this.wss == null){
      this.wss = new WebSocket.Server({ server });
    }
  }

  getRooms(){
    return this.rooms;
  }

  createRoom(roomId, creatorId, joinToken, messageCallback) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = {
        messageCallback : messageCallback,
        creatorId : creatorId,
        joinToken: joinToken,
        clients : [],
      };
      return true;
    }
    return false;
  }

  getRoom(roomId){
    if (this.rooms[roomId]) {
      return this.rooms[roomId];
    }

    return null;
  }

  broadcastMessage(roomId, message) {
    const room = this.rooms[roomId];
    if (room) {
      room.clients.forEach((client) => {
        client.send(JSON.stringify(message));
      });
    }
  }

  joinRoom(roomId, creatorId, ws) {
    const room = this.rooms[roomId];
    if (room && room.clients.length === 0 && room.creatorId === creatorId) {
      room.clients.add(ws);
      return true;
    } 
    
    return false;
  }

  isMessageValid(message){
    return typeof message.type !== 'undefined' && message.creatorId !== 'undefined';
  }

  listen() {
    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      ws.on('message', (data) => {
        console.log(`Received message: ${data}`);

        let message;
        try {
          message = JSON.parse(data);
        } catch (err) {
          console.error(`Error parsing incoming message: ${err}`);
          return;
        }

        if(!this.isMessageValid(message)){
          ws.close(0);
        }

        if(message.type === 'join'){
          if(!this.joinRoom(message.room, message, ws)){
            ws.close(0);
          }
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');

        for (const room of Object.values(this.rooms)) {
          room.delete(ws);
        }
      });
    });
  }
}

const WebSocketHandlerInstance = new WebSocketHandler();
module.exports = WebSocketHandlerInstance;