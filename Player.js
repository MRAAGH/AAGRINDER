

class Player {
  constructor(x, y, name, socket){
    this.x = x;
    this.y = y;
    this.name = name;
    this.socket = socket;
    this.subscriptions = [];
    this.chunkUpdates = [];
    this.changeObj = {};
    this.hacker = false;
    this.hackedAt = -1;
    this.branch = 0;
    this.online = false;
  }


}

exports.Player = Player;
