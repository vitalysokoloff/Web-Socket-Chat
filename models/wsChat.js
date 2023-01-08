import events, { EventEmitter } from "events";
import express from "express";
import ws, { WebSocketServer } from "ws";
import { route, interact } from "../controls/all.js"

export class WebSocketChat extends EventEmitter{
    /**
     * 
     * @param {Object} users ip: {"name":,"background": "#", "nameColor": "#", "admin": bool}
     * @param {Object} config  "pagePort":, "chatPort":, "pageHost":, "chatHost":, "serverName": string, "ChatName": string, "background":  "#"
     */
    constructor(users, config){
        super();
        this._users = users;
        this._cfg = config;
        this._clients = {};
        this._webServer = express();
        this._webSocketServer = new WebSocketServer({ port: this._cfg.chatPort, host: this._cfg.chatHost });        
        this._cfg.topic = "...";
    }

    run(){
        route(this._webServer, this._cfg);
        interact(this._webSocketServer, this._users, this._clients, this._cfg);
        
        this.on("topic", function(data){
            this._changeTopic(data);
        });
        
        console.log("Сервер запущен.");
    }    

    _changeTopic(data){
        this._cfg.topic = "Тема: " + data;
    }
}