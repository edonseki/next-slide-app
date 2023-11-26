const { jwtVerify } = require("./cryptor");
const RoomManagerInstance = require('../utility/room-manager');

module.exports = (req, res, next) => {

    if (req.method === 'POST' && req.url === '/room') {
        //check authorization and chrome extension here
        next();
        return;
    }
      
    let token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Forbidden!' });
    }

    token = token.replace("Bearer ", "");

    try{
        const decryptedToken = jwtVerify(token);
        if(decryptedToken.data.role !== "host"){
            return res.status(401).json({ error: 'Forbidden!' });
        }

        const room = RoomManagerInstance.getRoom(decryptedToken.data.roomId);
        if(!room){
            return res.status(401).json({ error: 'Forbidden!' });
        }

        if(decryptedToken.data.clientId !== room.creatorId){
            return res.status(401).json({ error: 'Forbidden!' });
        }
    }catch(e){
        return res.status(401).json({ error: 'Forbidden!' });
    }

    next();
};