const socket = io()
var messagetemplate=document.querySelector('#message-template').innerHTML
const showMessage = document.querySelector('#show-message');
const groupname = document.querySelector('#h1').innerHTML
const body = document.querySelector('body')


document.querySelector('#message').addEventListener('submit',(e)=>{
    e.preventDefault()
    var inputMessage = document.querySelector('#input-message').value

    socket.emit('message',inputMessage,groupname)
    document.querySelector('#input-message').value=""

})

window.scrollTo(0,body.offsetHeight)

socket.on('message',(username,message,timestamp,group)=>{
    if(groupname==group){
        window.scrollTo(0,body.offsetHeight)
        var t=new Date().getTime();
        if(moment(t).format('l')==moment(timestamp).format('l')){
            var time =  moment(timestamp).format('LT');
         }else{
             var time = moment(timestamp).format('lll')
         }
    const html = Mustache.render(messagetemplate,{
        username,
        timestamp:time,
        message
    })
    showMessage.insertAdjacentHTML('beforeend',html)
}
})