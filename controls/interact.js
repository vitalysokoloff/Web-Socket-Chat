import { MessageMaker } from "./messageMaker.js";

export function interact(WSS, users, clients, cfg){      
    function isLsCommand(str){
        let reg = /^\/ls/;
        return reg.test(str);
    }

    function isTopicCommand(str){
        let reg = /^\/topic/;
        return reg.test(str);
    }

    function sendToAll(message, channel){
        for (let key in clients) {    
            if (users[key].channel == channel)    
                clients[key].send(JSON.stringify(message));
        }
    }

    function getUsersList(channel){
        let list = [];
        for (let key in clients) {
            if (users[key].channel == channel) 
                list.push(users[key].name);
        }
        return list.join(", ");
    }

    WSS.on('connection', function(ws, req) {       
        function heartbeat(){}  

        let ip = req.socket.remoteAddress;
        if (ip in users == false){
            ws.close();
            return;
        }

        let user = users[ip];
        let channel = users[ip].channel;

        let m = new MessageMaker(cfg);

        clients[ip] = ws;

        console.log("Новое соединение c: " + user.name + " [" + ip  + "]");
        console.log("Список:");
        console.log(Object.keys(clients));

        ws.send(JSON.stringify(m.makeServerMsg( user.name + ", добро пожаловать на канал #" + channel + "!", user.name)));
        ws.send(JSON.stringify(m.makeServerMsg("Тема: " + cfg.channels[channel].topic)));
        ws.send(JSON.stringify(m.makeServerMsg("/hi", users[ip].name)));

        sendToAll(m.makeServerMsg("* " + user.name + " вошёл в чат"), channel);
      
        ws.on('message', function(message) {  
            if (message.length > 0){
                message = message.toString().slice(0, 500);
                
                if(isLsCommand(message)){
                    ws.emit("ls", "");
                    return;
                }

                if(isTopicCommand(message)){
                    ws.emit("topic", {channel: channel, message: message});
                    return;
                }

                sendToAll(m.makeUserMsg(user, message), channel);
            }else{
                return;
            }
        });

        ws.on('close', function() {
            clearInterval(interval);
            if (ip in users){                
                console.log("Закрыто соединение c: " + user.name + " [" + ip  + "]");
                sendToAll(m.makeServerMsg("* " + user.name + " вышел из чата"), channel);
                delete clients[ip];
            }             
        });;

        const interval = setInterval(function ping() {
                ws.ping();
        }, 5000);

        ws.on('pong', heartbeat);
    
        ws.on('ls', function(data){
            this.send((JSON.stringify(m.makeServerMsg("/users " + getUsersList(channel)))));
        });

        ws.on('topic', function(data){
            if (user.admin){
                cfg.channels[data.channel].topic = data.message.toString().replace("/topic", "");
                sendToAll(m.makeServerMsg("* " + user.name + " сменил тему."), channel);
                sendToAll(m.makeServerMsg("Тема: " + cfg.channels[channel].topic), channel);
            }else{
                this.send((JSON.stringify(m.makeServerMsg("Вы не админ!!!"))));
            }
        });
        
    });  

}