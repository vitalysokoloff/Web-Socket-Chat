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
        
        let ip = req.socket.remoteAddress;
        let user = users[ip];

        console.log("Новое соединение c: " + user.name + " [" + ip  + "]");

        let m = new MessageMaker(cfg);

        clients[ip] = ws;
        clients[ip].send(JSON.stringify(m.makeServerMsg( user.name + ", добро пожаловать в чат " + cfg.chatName + "!", user.name)));
        let str = `Команды:
        /ls - Список онлайн пользователей;
        /topic <text> - сменить тему;
        Ctrl+Enter - отправить.`
        clients[ip].send(JSON.stringify(m.makeServerMsg("/hi", user.name)));
        clients[ip].send(JSON.stringify(m.makeServerMsg(str)));
        clients[ip].send(JSON.stringify(m.makeServerMsg("Тема: " + cfg.topic)));

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

        ws.on('close', function() {
          console.log("Закрыто соединение c: " + user.name + " [" + ip  + "]");
          sendToAll(m.makeServerMsg("* " + user.name + " вышел из чата"));
          delete clients[ip];
        });
    
        clients[ip].on('ls', function(data){
            this.send((JSON.stringify(m.makeServerMsg("Пользователи онлайн: " + getUsersList()))));
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