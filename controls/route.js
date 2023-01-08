import { __dirname, VIEWS, CSS, IMAGES} from "../paths.js";
import fs from "fs";
/**
 * 
 * @param {Express} webServer 
 * @param {Object} cfg "pagePort":, "chatPort":, "pageHost":, "chatHost":, "serverName": string, "ChatName": string, "background":  "#"
 */
export function route(webServer, cfg){
    webServer.get("/", function(req, res){
        let page = replace(fs.readFileSync( VIEWS + "/index.html", 'utf8'), "title", cfg.chatName);
	    res.write(page);
        res.end();
    });
    webServer.get(/\/\w+.js/, function(req, res){
        let page = replace(replace(fs.readFileSync(VIEWS + req.url , 'utf8'), "host", cfg.chatHost),
        "port",
        cfg.chatPort);
        
        res.attachment(req.url);
        res.type('js');
        res.send(page);
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