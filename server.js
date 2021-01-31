const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4: uuidv4} = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

var PEERLIST = [];


var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


app.use('/peerjs', peerServer);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});




app.post('/room', (req, res) => 
{
    res.redirect(`/${uuidv4()}`);
})

app.post('/index', (req, res) => {
    res.redirect('/')
})

app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room});
})


io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        PEERLIST.push(userId);
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('message', message => 
        {
            io.to(roomId).emit('create-message', message)
        })

        io.to(roomId).emit('send-peerlist', PEERLIST)

        socket.on('disconnect', ()=> {

            socket.to(roomId).broadcast.emit('user-disconnected', userId)

        })
    })
})




server.listen(process.env.PORT || 3030);