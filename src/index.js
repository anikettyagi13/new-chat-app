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
const {hash,compare}  = require('../utils/bcrypt/passhash')
const User = require('../utils/schema/user');
const Group = require('../utils/schema/group')


var error={};
var users;
var groups;
var gRoup
Group.find({}).then((group)=>{
      gRoup = group 
 }).catch((e)=>{
     console.log(e);
 });


mongoose.connect(process.env.MONGODB,{
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
    secret:process.env.SECRET,
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

app.get('/',(req,res)=>{
    res.redirect('/chat')
})

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
    res.render('signup.ejs',{error:e.message})
}
});

app.get('/login',(req,res)=>{
    res.render('login.ejs',{error:undefined})
});
app.post('/login',async(req,res)=>{
      try{const{error,isMatch}= await login(req.body.username,req.body.password);
        if(isMatch){
        const user = await User.findOne({ username:req.body.username })
        users=user
        // user.genrateToken(user);  
        // token=user.tokens[0].token
        
        req.users.username = user.username 
        res.redirect('/chat')
        }
        else{
            throw new Error(error)
        }
    }catch(e){
        res.render('login.ejs',{error:e.message})
      }
})


app.get('/chat',auth,async(req,res)=>{
    await req.user.populate({path:'group'}).execPopulate()
    res.render('index.ejs',{error:undefined,group:req.user.group,user:req.user})
})  

app.get('/logout',auth,async(req,res)=>{
    req.users.username= undefined
    res.redirect('/chat')
})

app.get('/addGroup',auth,async(req,res)=>{
    const group = await Group.find({})
    res.render('addGroup.ejs',{error:undefined,user:req.user})
    // res.render('addGroup.ejs',{error:undefined,group,error1:undefined})
})
app.post('/addGroup',auth,async (req,res)=>{
   try{ 
    if(!req.body.search){
    const group = await Group.findOne({ groupname:req.body.groupname })
    if(!group){
         throw new Error('no group found')
    }
     const isok=compare(req.body.password,group.password)
    if(!isok){
         throw new Error('INCORRECT PASSWORD')
    }
    groups=group;
    var yo=false;
    group.members.forEach((member)=>{
        if(member.member==req.user._id.toString()){
             yo=true;
        }
    })
    if(yo){
        grop = await Group.find({})
        return res.render('addGroup.ejs',{error:'user already a member of the group',user:req.user})
        // return res.render('addGroup.ejs',{error:'user already a member of the group',group:grop,error1:undefined})
    }else{
    group.members.push({member:req.user._id})
    await group.save()
    res.redirect('/chat/'+req.body.groupname)
    }
}

}catch(e){
    res.render('addGroup.ejs',{error:e.message,user:req.user})

    // res.render('addGroup.ejs',{error:e})
}
})


app.get('/chat/:name',auth,async(req,res)=>{
    try{const group = await Group.findOne({ groupname:req.params.name }) 
    if(!group){
        throw new Error('no group found')
    }var isThere = false;
    
    groups=group;
    group.members.forEach((member)=>{
        if(member.member==req.user._id.toString()){
            isThere=true
        }
    })
    if(!isThere){
        throw new Error('user not present in the group')
    }
    var time=[]
    var timestamp= new Date().getTime()
    group.members[0].chat.forEach((chat)=>{
        if(moment(Number(chat.time)).format('l')==moment(timestamp).format('l')){
            time.push(moment(Number(chat.time)).format('LT'))
        }else{
            time.push(moment(Number(chat.time)).format('lll'))
        }
    })
    return res.render('chat.ejs',{user:req.users,chat:group.members[0].chat,time:time,groupname:groups.groupname,user:req.user})
    }catch(e){
        
    res.render('index.ejs',{error:e,group:undefined,user:req.user})
    }
})


app.get('/chat/login/:groupname',auth,async(req,res)=>{
    const group = {
        groupname: req.params.groupname
    }
     res.render('grouplogin.ejs',{error:undefined,group:group,user:req.user})
})
app.post('/chat/login/:groupname',auth,async(req,res)=>{
    try{var group = await Group.findOne({ groupname:req.params.groupname })
     if(!group){
         throw new Error('NO GROUP')
     }
    //  console.log(req.user.password)
     const isok= await compare(req.body.password,group.password)
     group.members.forEach((group)=>{
         if(group.member==req.user._id.toString()){
             throw new Error('USER ALREADY PRESENT IN THE GROUP')             
         }
     })
     group.members.push({ member:req.user._id })
    //  console.log(group)
     await group.save()
     await req.user.populate({ path: 'group' }).execPopulate();
     if(!isok){
         throw new Error('WRONG PASSWORD')
     }
     res.redirect('/chat/'+group.groupname)
    }catch(e){
        res.render('grouplogin.ejs',{
            error:e.message,
            group:group,
            user:req.user
        })
    }
})

app.get('/createGroup',auth,(req,res)=>{
    res.render('create.ejs',{error:undefined,user:req.user})
    users=req.user;
})
app.post('/createGroup',auth,async(req,res)=>{
   try{
       
       const password=hash(req.body.password)
       const group = await new Group({
        groupname:req.body.groupname,
        password:req.body.password
        })
        group.members.push({member:req.user._id})
        await group.save()
        group.password=password;
        await group.save();
        gRoup.push(group);

   if(group){
   res.redirect('/chat')
   await req.users.populate({path:'group'}).execPopulate();
   }

}catch(e){
    res.render('create.ejs',{error:e.message,user:req.user})
}
})


io.on('connection',(socket)=>{
    console.log('Socket connection');

    socket.on('message',async(inputmessage,groupname,username)=>{
        var timestamp = new Date().getTime()
        groups= await Group.findOne({groupname:groupname});
        
        groups.members[0].chat.push({message:inputmessage,username:username,time:timestamp})
        // groups.members[0].chat.push({username:users.username})
        // groups.members[0].chat.push({time:timestamp})
        await groups.save()
        username= username
        groupname = groups.groupname
        io.emit('message',username,inputmessage,timestamp,groupname)
    })


    socket.on('search', async (k)=>{
      try{  let search=k.join('');
        // console.log(gRoup);
        var foundGroups=gRoup.filter((group)=>{
            return group.groupname.includes(search)
        })
        socket.emit('search',foundGroups)
    }catch(e){
        console.log(e);
    }
    })

    
    app.get('error',(req,res)=>{
        res.send(error)
    })
    socket.on('disconnect',()=>{
        console.log("CONNECTION DISMISSED")
    })
})

app.get('*',(req,res)=>{
    res.render('error.ejs',{error:'NO PAGE FOUND'})
})

server.listen(port,()=>{
    console.log("yo running");
})

// %$147&%$151&%$150&%$149&%$148&146&%$
// %$147&%$151&%$150&%$149&%$148&146&%$