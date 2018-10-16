const jwt = require('jsonwebtoken');

const { jwtSecret } = require("./config.js");

var issueToken = (data, time)=>{
	if(!data || !time){
		throw Error("Incomplete Details.");
	}
	var token = jwt.sign(data, jwtSecret, {expiresIn:time});
	return token;
}

var verifyToken = (token, cb)=>{
	if(!token){
		throw Error("Incomplete Details.");
	}
	jwt.verify(token,jwtSecret,function(err,data){
		if(err){
			return cb(false);
		}
		cb(data);
	});
}

var decodeToken = (token)=>{
	if(!token){
		throw Error("Incomplete Details.");
	}
	var decoded = jwt.decode(token,{complete:true});
	return decoded;
}

module.exports = {
 	issueToken,
    verifyToken,
 	decodeToken,
}