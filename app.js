import fs from "fs";
import { WebSocketChat } from "./models/wsChat.js";

let users = JSON.parse(fs.readFileSync("users.json"));
let cfg =  JSON.parse(fs.readFileSync("config.json"));

let chat = new WebSocketChat(users, cfg);
chat.run();