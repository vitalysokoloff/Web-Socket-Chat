import { MessageMaker } from "./messageMaker.js";

export function interact(WSS, cfg, users){      
    function isLsCommand(str){
        let reg = /^\/ls/;
        return reg.test(str);
    }

    function isTopicCommand(str){
        let reg = /^\/topic/;
        return reg.test(str);
    }

    function sendToAll(message, clients){
        for (let key in clients) {  
                clients[key].send(JSON.stringify(message));
        }
    }

    function getUsersList(clients){
        let list = [];
        for (let key in clients) {
                list.push(users[key].name);
        }
        return list.join(", ");
    }

    WSS.on('connection', function(ws, req) {       
        function heartbeat(){}        
        let ip = req.socket.remoteAddress;
        let channel = users[ip].channelName;

        if (!cfg.channels[channel].wl.includes(ip)){
            ws.close();
            console.log("Доступ заблокирован ip: " + ip + " на канал: " + channel);
            return;
        }

        let user = users[ip];
        let m = new MessageMaker(cfg);        
        let clients = cfg.channels[channel].clients;

        clients[ip] = ws;

        console.log("Новое соединение c: " + user.name + " [" + ip  + "]/ канал #" + channel);
        console.log("#" + channel + ":");
        console.log(Object.keys(clients));

        ws.send(JSON.stringify(m.makeServerMsg( user.name + ", добро пожаловать на канал #" + channel + "!", user.name)));
        ws.send(JSON.stringify(m.makeServerMsg("Тема: " + cfg.channels[channel].topic)));
        ws.send(JSON.stringify(m.makeServerMsg("/hi", users[ip].name)));

        sendToAll(m.makeServerMsg("* " + user.name + " вошёл в чат"), clients);
      
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

                sendToAll(m.makeUserMsg(user, message), clients);
            }else{
                return;
            }
        });

        ws.on('close', function() {
            clearInterval(interval);
            if (ip in users){                
                console.log("Закрыто соединение c: " + user.name + " [" + ip  + "]");
                sendToAll(m.makeServerMsg("* " + user.name + " вышел из чата"), clients);
                delete clients[ip];
            }             
        });;

        const interval = setInterval(function ping() {
                ws.ping();
        }, 5000);

        ws.on('pong', heartbeat);
    
        ws.on('ls', function(data){
            this.send((JSON.stringify(m.makeServerMsg("/users " + getUsersList(clients)))));
        });

        ws.on('topic', function(data){
            if (user.admin){
                cfg.channels[data.channel].topic = data.message.toString().replace("/topic", "");
                sendToAll(m.makeServerMsg("* " + user.name + " сменил тему."), clients);
                sendToAll(m.makeServerMsg("Тема: " + cfg.channels[channel].topic), clients);
            }else{
                this.send((JSON.stringify(m.makeServerMsg("Вы не админ!!!"))));
            }
        });
        
    });  

}