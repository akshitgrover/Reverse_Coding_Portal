const jwt = require("./../jwt.js");

module.exports = (req, res, next)=>{
    
    let authHeader = req.get("Authorization") || "";
    console.log(authHeader);
    let split = authHeader.split(" ");
    if(!authHeader || split[0] !== "Bearer"){
        return res.status(406).json({err:"Invalid authorization header"});
    }
    jwt.verifyToken(split[1], (data)=>{
        if(!data){
            return res.status(401).json({err:"Invalid token"});
        }
        res.locals.teamName = data.team;
        next();
    });

}