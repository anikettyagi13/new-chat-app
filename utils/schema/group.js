const mongoose = require('mongoose');

const groupSchema= new mongoose.Schema({
    groupname:{
        type:String,
        required:true,
        unique:true
    },
    members:[{
        member:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
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