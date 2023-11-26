const clientIpAddress = (req) => {
    if(req.headers['cf-connecting-ip']){
        return req.headers['cf-connecting-ip'];
    }

    if(req.headers['x-forwarded-for']){
        return req.headers['x-forwarded-for'];
    }

    if(req.socket.remoteAddress){
        return req.socket.remoteAddress;
    }

    return null;
}

module.exports = {clientIpAddress};