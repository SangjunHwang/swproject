const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}


var getUserMedia = navigator.getUserMedia;
myPeer.on('call', function(call) {
  getUserMedia({video: true, audio: true}, function(stream) {
    call.answer(stream); // Answer the call with an A/V stream.
    const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            console.log("stream one on")
            addVideoStream(video, userVideoStream)
        })
  });
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    console.log("add")
    addVideoStream(myVideo, stream)
    
    // 내가 봤을 때 call이라는 함수를 쓰는 것이 문제가 생기는 듯함. 근데 peerjs에선 call이란 함수를 사용함 ㅠ

    // myPeer.on('call', function(call) {
    //     //debug용으로 mypeeroncall을 추가했지만 출력되지 않음.
    //     console.log("mypeeroncall")
    //     call.answer(stream)
    //     const video = document.createElement('video')
    //     call.on('stream', userVideoStream => {
    //         console.log("stream one on")
    //         addVideoStream(video, userVideoStream)
    //     })
    // }, function(err) {
    //     console.log('Failed to get peercall stream' ,err);
    //   })

    socket.on('user-connected', userId => {
        console.log('User connected: ' + userId)
        connectectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    console.log('User disconnected: ' + userId)
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    console.log("mypeeron")
    socket.emit('join-room', ROOM_ID, id)
})

function connectectToNewUser(userId, stream) {
    console.log("connecttonew")
    var call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    console.log("hello world")
    console.log(stream)
    //call.on 함수가 안되서 stream 자체를 못받아오는가 했지만 그건 아님.
    
    //딱 여기까지만 출력됨
    call.on('stream', (userstream) => {
        console.log("stream on ~")
        addVideoStream(video, userstream)
    })
    // 여기서 닫으면 remove라고 뜨면서 잘 닫힘 뭐지?
    call.on('close', () => {
        console.log("remove")
        video.remove()
    })
    //이 부분에서도 peers에 userId를 잘 넣는 모습이 보임
    peers[userId] = call
}

function addVideoStream(video, stream){
    console.log("addvideostream")
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video);
    
    console.log(stream)
}