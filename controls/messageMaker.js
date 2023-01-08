export class MessageMaker{
    /**
     *
     * @param {Object} config "pagePort":, "chatPort":, "pageHost":, "chatHost":, "serverName": string, "ChatName": string, "background":  "#"
     */
    constructor(config){
        this._cfg = config
    }
    
    makeServerMsg(str, name){
        return {
            from: this._cfg.serverName, 
            content: str, 
            background: this._cfg.background,
            to: name
        }
    }

    makeUserMsg(user, str){
        return {
            from: user.name, 
            content: str, 
            background: user.background,
            nameColor: user.nameColor
        }
    }
}