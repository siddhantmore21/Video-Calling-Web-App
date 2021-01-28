 

const socket = io('/');

        const myVideo  = document.createElement('video');
        const videoGrid = document.getElementById('videoGrid');
        myVideo.muted = true;

        var peer = new Peer(undefined, {
            path: '/peerjs',
            host: '/',
            port: '443'
        }); 

        let myVideoStream;
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        }).then(stream => {
            myVideoStream = stream;
            console.log(myVideoStream);
            addVideoStream(myVideo, stream);
            
        

            peer.on('call', call => {
                call.answer(stream);
                const video = document.createElement('video')
                call.on('stream', userVideoStream => {
                    console.log(userVideoStream);
                    addVideoStream(video, userVideoStream)
                    
                })
            })

            socket.on('user-connected', userId => {
                connectNewUser(userId, stream);
            })

        })

       

        

        peer.on('open', id => {
            
            socket.emit('join-room', ROOM_ID, id);
        })
        
        

        function connectNewUser(userId, stream) 
        {
            console.log(`new user is connected - ${userId}`);

            const call = peer.call(userId, stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                console.log(userVideoStream)
                addVideoStream(video, userVideoStream)
            })
            call.on('close', () => {
                video.remove();
            })
        }


        function addVideoStream(video, stream)
        {
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            })
            videoGrid.append(video);
        }


        const inputbox =  document.getElementById('chat-input');
        const messagesUlElement = document.getElementById('chat-messages');
        console.log("message" +inputbox.value);

        document.addEventListener('keydown', sendMessage)

        function sendMessage(e)
        {
            if(e.which == 13 && inputbox.value !==0)
            {
                console.log(inputbox.value)
                socket.emit('message', inputbox.value);
                inputbox.value = '';
            }
        }

        socket.on('create-message', message => 
        {
            console.log("from server "+message);
            const newMessage = document.createElement('li');
            newMessage.classList.add('message');
            newMessage.innerHTML = `<b>user</b><br/>${message}`
            messagesUlElement.append(newMessage);
            scrolToBottom();
        })

        function scrolToBottom()
        {
            let chatWindow = document.getElementById('chat-container')
            
            chatWindow.scrollTo(0, chatWindow.scrollHeight)
        }

        const chatButton = document.getElementById('chat-button');
        const chatSection = document.getElementById('chat-section');

        chatButton.addEventListener('click', () => {
            chatSection.classList.toggle('hide')

        })




        const muteButton = document.getElementById('mute-button')
        const stopVideoButton = document.getElementById('stop-video-button')


        muteButton.addEventListener('click', muteUnmuteAudio)
        stopVideoButton.addEventListener('click', hideShowVideo)

        
        function muteUnmuteAudio()
        {
            const enabled = myVideoStream.getAudioTracks()[0].enabled;

            if(enabled)
            {
                myVideoStream.getAudioTracks()[0].enabled = false;
                updateButtonToUnmute()
            }
            else
            {
                myVideoStream.getAudioTracks()[0].enabled = true;
                updateButtonToMute()
            }

        }

        


        function updateButtonToUnmute()
        {
            const updatedUnmuteButton = `
            <i class="fa fa-microphone-slash unmute"></i>
            <span>Unmute</span>
            `
            muteButton.innerHTML = updatedUnmuteButton;
        }

        function updateButtonToMute()
        {
            const updatedMuteButton = `
            <i class="fa fa-microphone"></i>
            <span>Mute</span>
            `
            muteButton.innerHTML = updatedMuteButton;
        }


        function hideShowVideo()
        {
            const enabled = myVideoStream.getVideoTracks()[0].enabled;

            if(enabled)
            {
                myVideoStream.getVideoTracks()[0].enabled = false;
                updateButtonToPlay()
            }
            else
            {
                myVideoStream.getVideoTracks()[0].enabled = true;
                updateButtonToStop()
            }
        }



        function updateButtonToPlay()
        {
            const updatedPlayButton = `
            <i class="fa fa-video-slash play"></i>
            <span>Play Video</span>
            `
            stopVideoButton.innerHTML = updatedPlayButton;
        }

        function updateButtonToStop()
        {
            const updatedStopButton = `
            <i class="fa fa-video-camera"></i>
            <span>Stop Video</span>
            `
            stopVideoButton.innerHTML = updatedStopButton;
        }