const bcrypt = require('bcryptjs');
const User = require('../schema/user');

const  hashPassword=(user)=>{

         bcrypt.hash(user.password,8).then(async(hashedpassword)=>{
            console.log(hashedpassword)
            user.password = hashedpassword;
            await user.save()    
        }).catch((e)=>{ console.log(e) })
   
        
    }

const login= async(username,password)=>{
    try{const user = await User.findOne({ username:username })
    if(!user){
         throw new Error('NO user found!!')
    }
    else{
    const isMatch =await bcrypt.compare(password,user.password).catch((e)=>{
        return console.log("error from bcrypt.compare")
    })
    if(isMatch){
       //************************************************************************ 
       //************************************************************************ 
       //************************************************************************ 
       //************************************************************************ 
    }
    else{
        throw new Error('INCORRECT PASSWORD')
    }}
    }catch(e){
       console.log(e);
    }
}


    module.exports = {
    hashPassword,
    login
}