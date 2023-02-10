import { __dirname, VIEWS, CSS, IMAGES} from "../paths.js";
import fs from "fs";
/**
 * 
 * @param {Express} webServer 
 * @param {Object} cfg "pagePort":, "chatPort":, "pageHost":, "chatHost":, "serverName": string, "ChatName": string, "background":  "#"
 */
export function route(webServer, cfg, users){
  for (let key in cfg.channels){
    makePage(webServer, key, cfg.channels[key].wl, users);
  }

  webServer.get("/", function(req, res){
    res.send("ERROR");
    res.end();
  });
  webServer.get(/\/\w+.js/, function(req, res){
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
  webServer.get(/\/css\/\w+.css/, function(req, res){
    res.sendFile(VIEWS + req.url);
  });
  webServer.get(/\/images\/\w+.png/, function(req, res){
    res.sendFile(VIEWS + req.url);
  });
    
  webServer.listen(cfg.pagePort, cfg.pageHost);
}

function replace(str, keyWord, subStr){
    return str.replace("{{" + keyWord + "}}", subStr);    
}

function makePage(webServer, channelName, whiteList, users){
  webServer.get("/" + channelName, function(req, res){
    let ip = req.socket.remoteAddress;
    if (whiteList.includes(req.socket.remoteAddress)){
      let page = replace(fs.readFileSync( VIEWS + "/index.html", 'utf8'), "title", "#" + channelName);
      users[ip].channel = channelName;
	    res.write(page);
    }else{
      res.send("ERROR");
    }
    res.end();
  });
}