const express = require('express'); //creating express server
const app = express(); //app variable that runs express() function
const server = require('http').Server(app); //creating server that socket.io will use
const io = require('socket.io')(server); //passing the server to socket io
const {v4: uuidv4} = require('uuid'); //gives us dynamic url
const { ExpressPeerServer } = require('peer'); //express peer server
const peerServer = ExpressPeerServer(server, {
    debug: true
}); //peer server

//var PEERLIST = [];

const port = process.env.PORT || 3030;
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));//access to public folder


app.use('/peerjs', peerServer);
app.set('view engine', 'ejs'); //rendering views using ejs 



//render home page => index.ejs
app.get('/', (req, res) => {
    res.render('index');
});



//redirecting user to room => room.ejs
app.post('/room', (req, res) => 
{
    res.redirect(`/${uuidv4()}`);
})


//redirecting user to home page => index.ejs
app.post('/index', (req, res) => {
    res.redirect('/')
})


//rendering room
app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room});
})

//handling connection
io.on('connection', socket => {
    //listening when someone joins the room
    socket.on('join-room', (roomId, userId) => {
        //PEERLIST.push(userId);
        socket.join(roomId);  //let user join the room 
        socket.to(roomId).broadcast.emit('user-connected', userId); //tell frontend that user joined

        //sending message to front end
        socket.on('message', message => 
        {
            io.to(roomId).emit('create-message', message)
        })

        //io.to(roomId).emit('send-peerlist', PEERLIST)

        //user disconnect
        socket.on('disconnect', ()=> {

            socket.to(roomId).broadcast.emit('user-disconnected', userId) //tell frontend that user disconnected

        })
    })
})




server.listen(port); //listen to the port