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
        this._webServer = express();
        this._webSocketServer = new WebSocketServer({ port: this._cfg.chatPort, host: this._cfg.chatHost}); 

        for (let key in this._cfg.channels){
            this._cfg.channels[key].clients = {};
        }
    }

    run(){
        route(this._webServer, this._cfg, this._users);
        interact(this._webSocketServer, this._cfg, this._users);
    } 
}