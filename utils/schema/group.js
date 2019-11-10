const mongoose = require('mongoose');

const groupSchema= new mongoose.Schema({
    groupname:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        validate(value){
            console.log(value)
            if(value.length<6){
                console.log(value)
                throw new Error('CANNOT BE SMALLER THAN 6 CHARACTERS')
            }
        }
    },
    members:[{
        member:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        chat:[{
            username:{
                type:String,
                required:true
            },
            time:{
                type:String,
                required:true
            },
            message:{
                type:String
            }
        }]
    }]
})

const Group = mongoose.model('Group',groupSchema);

module.exports = Group;