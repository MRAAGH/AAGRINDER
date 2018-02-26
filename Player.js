

class Player {
  constructor(x, y, name, socket){
    this.x = x; // world pos
    this.y = y; // world pos
    this.name = name; // username
    this.socket = socket; // websocket of the current session
    this.subscriptions = []; // the chunks which are having updates sent to this client
    this.chunkUpdates = []; // the chunks which will be sent to this client as a whole
    this.changeObj = {}; // the terrain updates that the client actually needs
    this.hacker = false; // whether we are ignoring the player because he is desynched
    this.curAction = -1; // the index of the last accepted action
    this.branch = 0; // the current branch of this session (each desynch spawns new branch)
  }


}

exports.Player = Player;
