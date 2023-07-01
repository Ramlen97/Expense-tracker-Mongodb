const jwt = require('jsonwebtoken');

const generateToken=(id,name,isPremium)=>{
    // console.log(id); 
    return jwt.sign({userId:id,name:name,isPremium:isPremium},process.env.TOKEN_SECRET);
}

const verify=(token,key)=>{
    return jwt.verify(token,key);
}

module.exports={
    generateToken,
    verify
}