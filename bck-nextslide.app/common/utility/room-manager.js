class RoomManager {
  rooms = null;
  roomActivity = null;

  constructor() {
    this.rooms = {};
    this.roomActivity = {};
  }

  getRooms(){
    return this.rooms;
  }

  createRoom(roomId, creatorId, joinToken) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = {
        creatorId : creatorId,
        joinToken: joinToken,
        clients : [],
        commands: [],
        presentationDetails: {
          contentVersionId: "-",
          slideScreenshot: null,
          totalSlides: 0,
          currentSlide: 0
        }
      };
      this.roomActivity[roomId] = Date.now();
      return true;
    }
    return false;
  }

  deleteRoom(roomId){
    delete this.rooms[roomId];
  }

  getRoom(roomId){
    const isRoomActive = this.isRoomActive(roomId);
    if (this.rooms[roomId] && isRoomActive) {
      return this.rooms[roomId];
    }

    if (!isRoomActive){
      this.deleteRoom(roomId);
    }

    return null;
  }

  broadcastCommand(roomId, command) {
    const room = this.rooms[roomId];
    if (room) {
      room.commands.push(command);
    }
  }

  isRoomActive(roomId){
    if(typeof this.roomActivity[roomId] === 'undefined'){
      return false;
    }

    const differenceInMilliseconds = Math.abs(this.roomActivity[roomId] - Date.now());
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
    return differenceInSeconds < 8;
  }

  pullCommands(roomId){
    this.roomActivity[roomId] = Date.now();

    const commands = [];
    if (this.rooms[roomId]) {
      while(this.rooms[roomId].commands.length > 0){
        commands.push(this.rooms[roomId].commands.shift());
      }
    }
    return commands;
  }

  updatePresentationDetails(roomId, presentationDetails, contentVersionId){
    if (!this.rooms[roomId]) {
      return false;
    }

    presentationDetails['contentVersionId'] = contentVersionId

    this.rooms[roomId]["presentationDetails"] = presentationDetails;

    return true;
  }

  doesClientBelongToRoom(clientId, room){
    return room.clients.map(c=>c.clientId).includes(clientId);
  }

  joinRoom(roomId, tempClientId, username) {
    const room = this.rooms[roomId];
    
    if (!room) {
      return false;
    } 

    if(room.clients.length >=5){
        return false;
    }
    
    if(this.doesClientBelongToRoom(tempClientId, room)){
        return false;
    }

    room.clients.push({clientId: tempClientId, username});

    return true;
  }

  isMessageValid(message){
    return typeof message.type !== 'undefined' && message.creatorId !== 'undefined';
  }
}

const RoomManagerInstance = new RoomManager();
module.exports = RoomManagerInstance;