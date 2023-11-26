const jwt = require('jsonwebtoken');

const secretKey = "115f3d8d51ed3ecd9633fd9c8aa9de25"

// Encrypter function
const jwtSign = (object) => {
    return jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60), data: object}, secretKey);
};

// Decrypter function
const jwtVerify = (token) => {
    return jwt.verify(token, secretKey);
};

module.exports = {jwtSign, jwtVerify};