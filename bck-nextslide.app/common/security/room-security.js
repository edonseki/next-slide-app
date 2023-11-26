const { jwtVerify } = require("./cryptor");

const extractTokenOrFail = (req, res) => {
    let token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Forbidden!' });
    }

    token = token.replace("Bearer ", "");

    try{
        const decryptedToken = jwtVerify(token);
        return decryptedToken;
    }catch(e){
        return res.status(401).json({ error: 'Forbidden!' });
    }
}

module.exports = {extractTokenOrFail}