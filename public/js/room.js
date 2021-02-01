 

const socket = io('/'); //socket

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


        //getting our video stream
        let myVideoStream;
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        }).then(stream => {
            myVideoStream = stream;
            console.log(myVideoStream);

            //adding our video stream to the host screen
            addVideoStream(myVideo, stream);
            
            
        
            //answering the call when peer receives the call
            peer.on('call', call => {

                call.answer(stream); //sending them our stream to the user

                const video = document.createElement('video')
                //getting the video stream of other user who joins the call 
                call.on('stream', userVideoStream => {
                    console.log(userVideoStream);
                    //adding the users video stream to the host screen
                    addVideoStream(video, userVideoStream)
                    
                })
            })

            //user connects
            socket.on('user-connected', userId => {
                connectNewUser(userId, stream);
            })

        })

       //user disconnects
        socket.on('user-disconnected', userId => {

            if(peers[userId]){
                console.log(userId+ " disconnected")
                peers[userId].close();
            }
        })
        
        //when peer opens the new room 
        peer.on('open', id => {
            
            socket.emit('join-room', ROOM_ID, id);
        })
        
        
        //this function connects the new user
        function connectNewUser(userId, stream) 
        {
            console.log(`new user is connected - ${userId}`);
            const msg = "new user joined";
            setAlertMessage(msg)

            //calling the peer using the peer id  and sends them clients video stream 
            const call = peer.call(userId, stream);
            const video = document.createElement('video');

            //here client receives the hosts stream
            call.on('stream', userVideoStream => {
                console.log(userVideoStream)
                addVideoStream(video, userVideoStream) //adding the hosts stream to clients browser
            })
            call.on('close', ()=> {
                video.remove();
                
            })
            //assigning each peer to the call
            peers[userId] = call
        }


        //this is a function which adds the video stream to the browser
        function addVideoStream(video, stream)
        {
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            })
            videoGrid.append(video);
        }


        //disconnect the peer on leave call button pressed
        const leaveCallButton = document.getElementById('leave-call')
        leaveCallButton.addEventListener('click', ()=> {
            peer.disconnect();
            console.log("peer disconnected")
            const msg = "user disconnected";
            setAlertMessage(msg)
        })





        //Implementing chatting feature 
        const inputbox =  document.getElementById('chat-input');
        const messagesUlElement = document.getElementById('chat-messages');
        

        //listening to key down event
        document.addEventListener('keydown', sendMessage)

        function sendMessage(e)
        {
            if(e.which == 13 && inputbox.value.length !==0) //only executes when enter key is pressed and there is some chat in the input box
            {
                console.log(inputbox.value)
                socket.emit('message', inputbox.value);
                inputbox.value = '';
            }
        }

       
        //creating the message that is recieved from the server and appending it to the browser
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


        /*
        socket.on('send-peerlist', (peerlist) => 
        {
            console.log(peerlist)
           
            var i = 1;
            peerlist.forEach(element => {

                peers.push(element, `user${i}`)
                i++;



                
            });
            console.log(peers)

        })
         */

        //this function always makes sure that chat is scrolled to bottom
        function scrollToBottom()
        {
            let chatWindow = document.getElementById('chat-container')
            
            chatWindow.scrollTo(0, chatWindow.scrollHeight)
        }



        //enabling the chat to show or hide whwn clicked on chat button
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



        //mute unmute the audio 

        const muteButton = document.getElementById('mute-button')

        muteButton.addEventListener('click', muteUnmuteAudio)

        
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


        //show hide the video

        const stopVideoButton = document.getElementById('stop-video-button')
        stopVideoButton.addEventListener('click', hideShowVideo)

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


       /*

        screen share 


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

        
     */   


     //share screen to be implemented further
       const shareScreenButton = document.getElementById('share-screen-button');


       shareScreenButton.addEventListener('click', () => {
        const msg = "This feature is not yet available.";
        setAlertMessage(msg)
       })


    //copy the room link at the loading of room
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



    //updating the alert messages on the screen 
    function setAlertMessage(message)
    {
        alertMessageElement.innerHTML = message;
        
        setTimeout(function(){
            alertMessageElement.innerHTML = '';
        }, 1000);
    }