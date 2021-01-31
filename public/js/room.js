 

const socket = io('/');

        const myVideo  = document.createElement('video');
        const videoGrid = document.getElementById('videoGrid');
        myVideo.muted = true;
        const alertMessageElement = document.getElementById("alert-msg");

        var peer = new Peer(undefined, {
            path: '/peerjs',
            host: '/',
            port: '443'
            //port: 3030
        }); 

        const peers = {}
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

       
        socket.on('user-disconnected', userId => {

            if(peers[userId]){
                console.log(userId+ " disconnected")
                peers[userId].close();
            }
        })
        

        peer.on('open', id => {
            
            socket.emit('join-room', ROOM_ID, id);
        })
        
        
        const leaveCallButton = document.getElementById('leave-call')
        leaveCallButton.addEventListener('click', ()=> {
            peer.disconnect();
            console.log("peer disconnected")
            const msg = "user disconnected";
            setAlertMessage(msg)
        })

        function connectNewUser(userId, stream) 
        {
            console.log(`new user is connected - ${userId}`);
            const msg = "new user joined";
            setAlertMessage(msg)

            const call = peer.call(userId, stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                console.log(userVideoStream)
                addVideoStream(video, userVideoStream)
            })
            call.on('close', ()=> {
                video.remove();
                
            })

            peers[userId] = call
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
            if(e.which == 13 && inputbox.value.length !==0)
            {
                console.log(inputbox.value)
                socket.emit('message', inputbox.value);
                inputbox.value = '';
            }
        }

       
        socket.on('create-message', (message) => 
        {
            
            if(chatSection.classList.contains('hide'))
            {
                chatButton.style.color = 'green';
                chatButton.innerHTML = '<i class="fa fa-comment-alt"></i><span>Chat <sup>(1)</sup></span>'
            }
            else
            {
                chatButton.style.color = 'black';
                chatButton.innerHTML = '<i class="fa fa-comment-alt"></i><span>Chat</span>'


            }
            const msg = "new message";
            setAlertMessage(msg)
            console.log("from server "+message);
            const newMessage = document.createElement('li');
            newMessage.classList.add('message');
            newMessage.innerHTML = `<b>user</b><br/>${message}`
            messagesUlElement.append(newMessage);
            scrollToBottom();
        })


        // socket.on('send-peerlist', (peerlist) => 
        // {
        //     console.log(peerlist)
           
        //     var i = 1;
        //     peerlist.forEach(element => {

        //         peers.push(element, `user${i}`)
        //         i++;



                
        //     });
        //     console.log(peers)

        // })

        function scrollToBottom()
        {
            let chatWindow = document.getElementById('chat-container')
            
            chatWindow.scrollTo(0, chatWindow.scrollHeight)
        }

        const chatButton = document.getElementById('chat-button');
        const chatSection = document.getElementById('chat-section');

        chatButton.addEventListener('click', () => {
            chatSection.classList.toggle('hide')
            if(chatButton.style.color == 'green')
            {
                chatButton.style.color = 'black';
                chatButton.innerHTML = '<i class="fa fa-comment-alt"></i><span>Chat</span>' 
            }


            

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
                const msg = "audio muted";
                setAlertMessage(msg)
            }
            else
            {
                myVideoStream.getAudioTracks()[0].enabled = true;
                updateButtonToMute()
                const msg = "audio Unmuted";
                setAlertMessage(msg)
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
                const msg = "video is off";
                setAlertMessage(msg)
            }
            else
            {
                myVideoStream.getVideoTracks()[0].enabled = true;
                updateButtonToStop()
                const msg = "video is on";
                setAlertMessage(msg)
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



        //screen share 


        const shareScreenButton = document.getElementById('share-screen-button');


        shareScreenButton.addEventListener('click', shareScreen)

        function shareScreen()
        {
            navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    voiceSuppression: true
                }
            }).then((stream) => {
                const video = document.createElement('video');
                addVideoStream(video, stream)

            }).catch((err) => {
                console.log('error: '+err)
            })
        }




    const roomLinkInput = document.getElementById('room-link-input');
    const copyRoomLinkButton = document.getElementById('copy-room-link-button');
    roomLinkInput.value = window.location.href;


    copyRoomLinkButton.addEventListener('click', ()=> {
        roomLinkInput.select();
        roomLinkInput.setSelectionRange(0, 99999)
        document.execCommand("copy");
        console.log("Copied the text: " + roomLinkInput.value);

        const copyLinkStatus = document.getElementById('link-copied-status');
        copyLinkStatus.innerHTML = "<i>link copied successfully</i>";
        copyLinkStatus.style.color = "green";
        const msg = "copied room link";
        setAlertMessage(msg)
    })


    function setAlertMessage(message)
    {
        alertMessageElement.innerHTML = message;
        
        setTimeout(function(){
            alertMessageElement.innerHTML = '';
        }, 1000);
    }