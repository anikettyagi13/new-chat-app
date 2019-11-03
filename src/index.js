const express = require('express');
const mongoose  = require('mongoose');
const socketio = require('socket.io');
const http = require('http');
const bodyparser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
const sessions = require('client-sessions')
const moment = require('moment')
const {hashPassword,login} = require('../utils/bcrypt/bcrypt')
const User = require('../utils/schema/user');
const Group = require('../utils/schema/group')


var error={};
var users;
var groups;


mongoose.connect('mongodb://localhost:27017/new-chat-app',{
 useNewUrlParser:true,
 useCreateIndex:true
});
const viewPath = path.join(__dirname+'/../utils/pages')
const port = process.env.PORT||3000;

const app= express();
app.use(express.static(viewPath))
app.set('views',viewPath);
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
app.set('views',viewPath);
app.use(sessions({
    cookieName:'users',
    secret:'yahan tak pauch gaye',
    duration: 24*60*60*60
}))


const auth = async(req,res,next)=>{
    try{
        if(!req.users.username){
            return res.redirect('/login')
        }
    const user = await User.findOne({ username:req.users.username })
    if(!user){
        res.redirect('/login')     
    }
    req.user = user;
    users = user;
    // req.token = token;
    next();
}catch(e){
    console.log(e)
}
}


app.use(bodyparser.urlencoded({ extended:true }))
const server = http.createServer(app);
const io = socketio(server);


app.get('/signup',(req,res)=>{
    res.render('signup.ejs',{error:undefined})
})
app.post('/signup',async(req,res)=>{
    try{
        const user= new User({
        username: req.body.username,
        password: req.body.password
    })
    await user.save()
    // await user.genrateToken(user);
    // token=user.tokens[0].token; 
    req.users.username = user.username
    hashPassword(user)
    res.redirect('/chat')
}catch(e){
    res.render('signup.ejs',{error:'user already present with this username'})
}
});

app.get('/login',(req,res)=>{
    res.render('login.ejs',{error:undefined})
});
app.post('/login',async(req,res)=>{
      try{login(req.body.username,req.body.password);
        const user = await User.findOne({ username:req.body.username })
        users=user
        // user.genrateToken(user);  
        // token=user.tokens[0].token
        req.users.username = user.username 
        res.redirect('/chat')
    }catch(e){
        res.render('login.ejs',{error:'no user present with these credentials'})
      }
})

app.get('/hehe',auth,(req,res)=>{
    res.render('index');
})

app.get('/chat',auth,async(req,res)=>{
    await req.user.populate({path:'group'}).execPopulate()
    console.log(req.user.group)
    res.render('index.ejs',{error:undefined,group:req.user.group})
})  

app.get('/logout',auth,async(req,res)=>{
    req.users.username= undefined
    res.redirect('/chat')
})
app.get('/addGroup',auth,(req,res)=>{
    res.render('addGroup.ejs',{error:undefined})
})
app.post('/addGroup',auth,async (req,res)=>{
    const group = await Group.findOne({ groupname:req.body.groupname })
    if(!group){
        console.log('no group found')
    }
    groups=group;
    var yo=false;
    group.members.forEach((member)=>{
        if(member.member==req.user._id.toString()){
             yo=true;
        }
    })
    if(yo){
        return res.render('addGroup.ejs',{error:'user already a member of the group'})
    }else{
    group.members.push({member:req.user._id})
    await group.save()
    res.redirect('/chat/'+req.body.groupname)
    }
})
app.get('/chat/:name',auth,async(req,res)=>{
    console.log(req.params.name)
    try{const group = await Group.findOne({ groupname:req.params.name }) 
    console.log("yooooodfgh",group.groupname)   
    if(!group){
        throw new Error('no group found')
    }var isThere = false;
    
    groups=group;
    console.log(groups.groupname,"asdfxgvhbjnkl")
    group.members.forEach((member)=>{
        if(member.member==req.user._id.toString()){
            isThere=true
        }
    })
    if(!isThere){
        throw new Error('user not present in the group')
    }
    return res.render('chat.ejs',{chat:groups.members[0].chat,groupname:groups.groupname})
    }catch(e){
        
    res.render('index.ejs',{error:e,group:undefined})
    }
})
app.get('/chat/:name',auth,async(req,res)=>{
    try{
        console.log(req.params.name)
        if(!group){
            throw new Error('no group found')
        }var isThere=false;
        groups = group;
        group.members.forEach((member)=>{
            if(member.member==req.user._id.toString()){
                isThere=true
            }
        })
        if(!isThere){
            throw new Error('user not present in the group')
        }
        res.render('chat.ejs',{chat:groups.members[0].chat,groupname:group.groupname})

    }catch(e){
        console.log(e)
    }
})


io.on('connection',(socket)=>{
    console.log('Socket connection');


    app.get('/createGroup',auth,(req,res)=>{
        res.render('create.ejs',{error:undefined})
        users=req.user;
    })
    app.post('/createGroup',async(req,res)=>{
       try{
           console.log("hahahha")
           if(users){
        const group = await new Group({
            groupname:req.body.groupname,
            })
            group.members.push({member:users._id})
            await group.save()
       if(group){
       res.redirect('/chat')
       await users.populate({path:'group'}).execPopulate();
       }
    }else{
        res.redirect('/login')
    }
    }catch(e){
        res.render('create.ejs',{error:'group with this name is already present'})
    }
    })
    
    
    socket.on('message',async(inputmessage,groupname)=>{
        var timestamp = new Date().getTime()
        groups= await Group.findOne({groupname:groupname});
        console.log(groups.groupname)
        timestamp = moment(timestamp).format('h:mm a')

        groups.members[0].chat.push({message:inputmessage,username:users.username,time:timestamp})
        // groups.members[0].chat.push({username:users.username})
        // groups.members[0].chat.push({time:timestamp})
        await groups.save()
        username= users.username
        groupname = groups.groupname
        io.emit('message',username,inputmessage,timestamp,groupname)
    })

    
    app.get('error',(req,res)=>{
        res.send(error)
    })
    socket.on('disconnect',()=>{
        console.log("CONNECTION DISMISSED")
    })
})









server.listen(port,()=>{
    console.log("yo running");
})