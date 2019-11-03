const socket = io()
var messagetemplate=document.querySelector('#message-template').innerHTML
const showMessage = document.querySelector('#show-message');
const groupname = document.querySelector('#h1').innerHTML
const body = document.querySelector('body')
console.log(groupname);

document.querySelector('#message').addEventListener('submit',(e)=>{
    e.preventDefault()
    var inputMessage = document.querySelector('#input-message').value

    socket.emit('message',inputMessage,groupname)
    document.querySelector('#input-message').value=""
    console.log(inputMessage)

})

socket.on('message',(username,message,timestamp,group)=>{
    if(groupname==group){
        window.scrollTo(0,body.offsetHeight)
    const html = Mustache.render(messagetemplate,{
        username,
        timestamp,
        message
    })
    showMessage.insertAdjacentHTML('beforeend',html)
}
})