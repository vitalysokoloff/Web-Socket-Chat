import { __dirname, VIEWS, CSS, IMAGES} from "../paths.js";
import fs from "fs";
/**
 * 
 * @param {Express} webServer 
 * @param {Object} cfg "pagePort":, "chatPort":, "pageHost":, "chatHost":, "serverName": string, "ChatName": string, "background":  "#"
 */
export function route(webServer, cfg, users){
  webServer.get("/", function(req, res){
    res.send("ERROR");
    res.end();
  });

  webServer.get(/\/\w+$/, function(req, res){
    let ip = req.socket.remoteAddress;
    let channelName = req.url.replace("/", "");
    let isExist = channelName in cfg.channels;
    if (isExist){
      if (cfg.channels[channelName].wl.includes(ip)){
        let page = replace(fs.readFileSync( VIEWS + "/index.html", 'utf8'), "title", "#" + channelName);
        users[ip].channelName = channelName;
        res.write(page);
      }else{
        res.send("ERROR: WRONG WAY");
        console.log("err: ip: " + ip + " тучиться тот кого не звали");
      }
      res.end();
    }else{
      res.send("ERROR: DOESN'T EXIST");
      console.log("err: ip: " + ip +  " неверно ввёл имя канала");
      res.end();
    }
    
  });  

  webServer.get(/\/\w+\.js/, function(req, res){
    if (req.socket.remoteAddress in users){
      let page = replace(replace(fs.readFileSync(VIEWS + req.url , 'utf8'), "host", cfg.chatHost),
      "port",
      cfg.chatPort);
          
      res.attachment(req.url);
      res.type('js');
      res.send(page);
    }else{
      res.send("ERROR");
    }
    res.end();
  });

  webServer.get(/\/css\/\w+\.css/, function(req, res){
    res.sendFile(VIEWS + req.url);
  });

  webServer.get(/\/images\/\w+\.png/, function(req, res){
    res.sendFile(VIEWS + req.url);
  });
    
  webServer.listen(cfg.pagePort, cfg.pageHost);
}

function replace(str, keyWord, subStr){
    return str.replace("{{" + keyWord + "}}", subStr);    
}