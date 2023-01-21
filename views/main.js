let wss = new WebSocket("ws://{{host}}:{{port}}");
let enterDown = false;
let optOpen = false;

let output = document.getElementById('messages');

let userName = "";
let users = "";

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

document.getElementById("options").addEventListener( "click", function(e){
    if (optOpen){
        document.getElementById("dialog").remove();
        optOpen = false;
        document.getElementById("options").style="background: url(images/optn.png)"
    }else{
        sendCmd("/ls");
        let dialog = document.createElement("div");
        dialog.className = "optn";
        dialog.id = "dialog";
        output.append(dialog);
        optOpen = true;
        document.getElementById("options").style="background: url(images/hide.png)"
    }
});

wss.onmessage = function(e) {
    let msgObject = JSON.parse(e.data);
    let time = (new Date).toLocaleString();

    if (msgObject.content == "/hi"){
        userName = msgObject.to;
        console.log(userName);
        return;
    }

    if (isUsersLs(msgObject.content)){
       users = msgObject.content.replace(/^\/users/, "");
       document.getElementById("dialog").innerHTML = "Пользователи онлайн:<br>" + users + "<p>Список текстовых команд:<br>/topic - сменить тему чата";       
       return;
    }
    
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

function send(id, ...str) {
    let input = document.getElementById(id);
    if (input.value.length > 0){
        wss.send(input.value);
        input.value = "";
    }
    if (str != undefined){
        input.value = str;
        input.focus();
    }
}

function sendCmd(str) {
    wss.send(str);
}

function isUsersLs(str){
    let reg = /^\/users/;
    return reg.test(str);
}

