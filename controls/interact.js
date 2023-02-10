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

    function sendToAll(message){
        for (let key in clients) {        
            clients[key].send(JSON.stringify(message));
        }
    }

    function getUsersList(){
        let list = [];
        for (let key in clients) {
            list.push(users[key].name);
        }
        return list.join(", ");
    }

    WSS.on('connection', function(ws, req) {       
        function heartbeat(){
            this.isAlive = true;
        }  

        let ip = req.socket.remoteAddress;
        if (ip in users == false){
            ws.close();
            return;
        }        
        let user = users[ip];
        users[ip].isAlive = true;

        console.log("Новое соединение c: " + user.name + " [" + ip  + "]");

        let m = new MessageMaker(cfg);

        clients[ip] = ws;
        clients[ip].send(JSON.stringify(m.makeServerMsg( user.name + ", добро пожаловать в чат " + cfg.chatName + "!", user.name)));
        clients[ip].send(JSON.stringify(m.makeServerMsg("Тема: " + cfg.topic)));
        clients[ip].send(JSON.stringify(m.makeServerMsg("/hi", users[ip].name)));

        sendToAll(m.makeServerMsg("* " + user.name + " вошёл в чат"));
      
        clients[ip].on('message', function(message) {  
            if (message.length > 0){
                message = message.toString().slice(0, 500);
                
                if(isLsCommand(message)){
                    ws.emit("ls", "");
                    return;
                }

                if(isTopicCommand(message)){
                    ws.emit("topic", message);
                    return;
                }

                sendToAll(m.makeUserMsg(user, message));
            }else{
                return;
            }
        });

        clients[ip].on('close', function() {
            if (ip in users){
                clearInterval(interval);
                console.log("Закрыто соединение c: " + user.name + " [" + ip  + "]");
                sendToAll(m.makeServerMsg("* " + user.name + " вышел из чата"));
                delete clients[ip];
            }             
        });;

        const interval = setInterval(function ping() {          
                clients[ip].isAlive = false;
                clients[ip].ping();
        }, 5000);

        clients[ip].on('pong', heartbeat);
    
        clients[ip].on('ls', function(data){
            this.send((JSON.stringify(m.makeServerMsg("/users " + getUsersList()))));
        });

        clients[ip].on('topic', function(data){
            if (user.admin){
                cfg.topic = data.toString().replace("/topic", "");
                sendToAll(m.makeServerMsg("* " + user.name + " сменил тему."));
                sendToAll(m.makeServerMsg("Тема: " + cfg.topic));
            }else{
                this.send((JSON.stringify(m.makeServerMsg("Вы не админ!!!"))));
            }
        });
        
    });  

}