const socket = io();

// const inputMessage = document.querySelector('#input-message').value
// const messagetemplate= document.querySelector('#message-template').innerHTML
// const showMessage = document.querySelector('#show-message')

// document.querySelector('#message').addEventListener('submit',(e)=>{
//     e.preventDefault()
//     socket.emit('message',inputMessage)

// })

// socket.on('message',(username,message,timestamp)=>{
//     const html = Mustace.render(messagetemplate,{
//         username,
//         timestamp,
//         message
//     })
//     showMessage.insertAdjacentHTML('beforeend',html)
// })