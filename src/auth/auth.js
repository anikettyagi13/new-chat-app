const jwt = require('jsonwebtoken');
const User = require('../../utils/schema/user');


const auth = async(req,res,next)=>{
    try{
        if(!token){
             res.redirect('/login')
        }
        const decoded = jwt.verify(token,'yoyiyo')
    const user = await User.findOne({ username:decoded.username })
    console.log(user)
    if(!user){
        res.redirect('/login')     
    }
    req.user = user;
    next();
}catch(e){
    console.log(e)
}
}


module.exports = auth;