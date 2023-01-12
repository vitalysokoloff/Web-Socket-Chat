let wss = new WebSocket("ws://{{host}}:{{port}}");
let enterDown = false;

let userName = "";

document.getElementById('message').addEventListener( "keydown" , function(e) { 
    if (e.key == "Enter" && e.ctrlKey){
        if (!enterDown){
            send("message");
            enterDown = true;
        }
    }
});

document.getElementById('message').addEventListener( "keyup" , function(e) { 
    if (e.key == "Enter"){
        if (enterDown){
            enterDown = false;
        }
    }
});

document.getElementById("sendButton").addEventListener( "click", function(e){
    send("message");
});

document.getElementById("lsButton").addEventListener( "click", function(e){
    sendCmd("message", "/ls");
    send("message");

});

document.getElementById("topicButton").addEventListener( "click", function(e){
    sendCmd("message", "/topic ");
});

wss.onmessage = function(e) {
    let msgObject = JSON.parse(e.data);
    let time = (new Date).toLocaleString();
    
    if (msgObject.content == "/hi"){
        userName = msgObject.to;
        return;
    }

    let output = document.getElementById('messages');
    let msg = document.createElement("div");
    let msgBody = document.createElement("div");
    let msgFrom = document.createElement("div");
    let msgTime = document.createElement("div");
    let msgText = document.createElement("div");  

    msg.className = "msg";  
    if (msgObject.from == userName){
        msg.style.textAlign = "right";
    }    

    msgBody.className = "msgBody";
    msgBody.style.background = msgObject.background;   
    
    msgFrom.className = "msgFrom";
    msgFrom.style.color = msgObject.nameColor;
    msgFrom.textContent = msgObject.from;

    msgText.className = "msgText";
    msgText.textContent = msgObject.content;
    
    msgTime.className = "msgTime";
    msgTime.textContent = time;
    
    output.append(msg);
    msg.append(msgBody);    
    msgBody.append(msgFrom);
    msgBody.append(msgText);
    msgBody.append(msgTime);

    output.scrollTop = output.scrollHeight;
}

function send(id) {
    let input = document.getElementById(id);
    if (input.value.length > 0){
        wss.send(input.value);
        input.value = "";
    }
}

function sendCmd(id, str) {
    let input = document.getElementById(id);
    input.value = str;
    input.focus();
}

