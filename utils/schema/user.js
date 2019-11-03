const mongoose= require('mongoose');
const jwt = require('jsonwebtoken')
const userSchema= mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true,
        unique:true,
        lowercase: true,
    },
    password:{
        type:String,
        required:true,
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