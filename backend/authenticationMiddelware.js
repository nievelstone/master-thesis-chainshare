const { getPublicKeyFromAuthKey } = require('./helpers');


async function isAuthenticated(req, res, next){
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const userPk = await getPublicKeyFromAuthKey(token);

    if(userPk == -1){
        res.status(401).json({message: "Unauthorized"});
    } else {
        req.userPk = userPk;
        next();
    }
}

module.exports = { isAuthenticated };