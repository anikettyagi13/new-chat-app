const mongoose= require('mongoose');
const jwt = require('jsonwebtoken')

const userSchema= mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true,
        unique:true,
        validate(value){
            if(value!=value.toLowerCase()){
                throw new Error('USERNAME MUST BE IN LOWERCASE')
            }
            if(value.includes(' ')){
                throw new Error('CANNOT HAVE SPACES IN BETWEEN')
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(value.length<5){
                throw new Error('password cannot be smaller than 6 characters'.toUpperCase())
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});


userSchema.virtual('group',{
    ref:'Group',
    localField:'_id',
    foreignField:'members.member'
});


userSchema.methods.genrateToken = async(user)=>{
    try{
        // const user = this;
        const token =  await jwt.sign({ username:user.username },'yoyiyo')
          user.tokens.push({token:token});
          await user.save();
  }catch(e){
        console.log(e)
     }
  }

const User = mongoose.model('User',userSchema)

module.exports = User