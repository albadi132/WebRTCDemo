

const peerConnections = {};
let localStream;
let mediaStream;
let lsatMediaStream;
let targetConnectionId;
const acceptedConnectionIds = new Set();
// Initialize SignalR connection for WebRTC
let connection = new signalR.HubConnectionBuilder()
    .withUrl("/webrtchub")
    .build();

// ICE server configuration
//const iceConfig = {
//    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
//};
//const peerConnection = new RTCPeerConnection(iceConfig);


async function startConnection() {
    try {
        await connection.start();
       // console.log("SignalR connection for WebRTC started.");
        await init();
    } catch (err) {
     //   console.error("Error starting SignalR connection:", err);
        setTimeout(startConnection, 2000); 
    }
}


connection.on("ReceiveNewAnswer", async (fromUserId, answer) => {
   
    const peerConnection = peerConnections[fromUserId];
    await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
    console.log("== ReceiveNewAnswer ==");
    console.log(peerConnection);
    console.log("== End ReceiveNewAnswer ==");


});



connection.on("ReceiveIceCandidate", async (candidate, forUserID) => {

  await   peerConnections[forUserID].addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
       
});

connection.on("ResaveNewOffer", async (fromUserId, offer) => {
   
    console.log("== ResaveNewOffer ==");
    //console.log("== ResaveOffer ==");
    const peerConnection = await  createPeerConnection(fromUserId);
    //console.log("== ResaveOffer ==");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
   
    console.log(peerConnection);
    //console.log("== End ResaveOffer ==");
    // Send the answer back to the user who sent the offer
    await connection.invoke("SendAnswerForUser", JSON.stringify(answer), fromUserId);
});

connection.on("JoinRoom", async (requestdUserId) => {

    const peerConnection = await createPeerConnection(requestdUserId);
   
       const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    await connection.invoke("SendOfferForNewUser", JSON.stringify(offer), requestdUserId);

});

connection.on("DisconnectedRoom", async (UserId) => {
  
    const videoElement = document.getElementById(`user-${UserId}`);
    
    
    if (videoElement) {
        videoElement.parentElement.remove(); 
        console.log(`User ${UserId} has disconnected and their video element was removed.`);
    } else {
        console.log(`No video element found for user ${UserId}.`);
    }
});

connection.on("RequestAcceptOffers", async (receivedConnectionId, requestAcceptOffers) => {
   await  acceptOffers(receivedConnectionId, requestAcceptOffers );
});



async function init() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  
    document.getElementById('user-1').srcObject = localStream;

    localStream.getTracks().forEach((track) => {

        peerConnection.addTrack(track, localStream);
        mediaStream = localStream['id'];
      
    });

  
}
async function shareScreen() {
    try {
       
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" }
        });

        
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

       
        localStream = new MediaStream([
            ...screenStream.getVideoTracks(), 
            ...audioStream.getAudioTracks()   
        ]);

        
        document.getElementById('user-1').srcObject = localStream;

       
        const videoTrack = screenStream.getVideoTracks()[0];
        for (const userId in peerConnections) {
            const peerConnection = peerConnections[userId];

           
            const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
            if (sender) {
                await sender.replaceTrack(videoTrack);
            }
        }

     
        videoTrack.onended = async () => {
            await switchBackToCamera();
        };

    } catch (error) {
        console.error("Error sharing screen: ", error);
    }
}

async function switchBackToCamera() {
    
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const videoTrack = cameraStream.getVideoTracks()[0];

    
    localStream = cameraStream;
    document.getElementById('user-1').srcObject = localStream;

   
    for (const userId in peerConnections) {
        const peerConnection = peerConnections[userId];

       
        const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
            await sender.replaceTrack(videoTrack);
        }
    }
}

// Function to create a new peer connection
async function createPeerConnection(userId) {
    debugger;
    const peerConnection = new RTCPeerConnection();

  
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.onicecandidate = async  (event) => {
        if (event.candidate) {
         await   connection.invoke("SendIceCandidate", JSON.stringify(event.candidate), userId)
        }
    };



    const videoContainer = document.createElement("div");
    videoContainer.classList.add("col-md-4", "mb-3");

    const video = document.createElement("video");
    video.classList.add("video-player");
    video.id = `user-${userId}`;
    video.autoplay = true;
    video.playsInline = true;


    videoContainer.appendChild(video)

    const mediaStream = new MediaStream();
    document.getElementById("videos").appendChild(videoContainer);
    video.srcObject = mediaStream;

    peerConnection.ontrack = async (event) => {

        event.streams[0].getTracks().find((track) => {
            mediaStream.addTrack(event.track);
        });
    };
    

    peerConnections[userId] = peerConnection;

    return peerConnection;
}


// Start the WebRTC connection
startConnection();

// SignalR connection for Chat
const connectionChat = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .build();

async function startChatConnection() {
    try {
        await connectionChat.start();
        console.log("SignalR connection for Chat started.");
    } catch (err) {
        console.error("Error starting SignalR connection for Chat:", err);
        setTimeout(startChatConnection, 2000); 
    }
}

connectionChat.on("ReceiveMessage", (user, message) => {
    const li = document.createElement("li");
    li.textContent = `${user}: ${message}`;
    document.getElementById("messagesList").appendChild(li);
});

startChatConnection();

function sendMessage() {
    const user = document.getElementById("userInput").value;
    const message = document.getElementById("messageInput").value;

    connectionChat.invoke("SendMessage", user, message).catch(err => console.error(err.toString()));
}

connectionChat.on("ReceiveNotification", function (message) {
    console.log("Notification: " + message);
});

