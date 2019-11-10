const {hash,compare} = require('../bcrypt/passhash');
const User = require('../schema/user');

const  hashPassword=async(user)=>{

            const hashedpassword=await hash(user.password)
            user.password = hashedpassword;
            await user.save()    
   
}

const login= async(username,password)=>{
    try{const user = await User.findOne({ username:username })
    if(!user){
         throw new Error('NO user found!!')
    }
    else{
    const isMatch =await compare(password,user.password)
    if(!isMatch){
        throw new Error('INCORRECT PASSWORD')

      }
      return{
          error:undefined,
          isMatch
      }
    }
    }catch(e){
       return {
           error:e,
           isMatch:undefined
     }
    }
}


    module.exports = {
    hashPassword,
    login
}