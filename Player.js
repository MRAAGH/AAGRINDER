const PLAYER_REACH = 7;

const Inventory = require('./public/js/sharedInventory.js').Inventory;

class Player {
  constructor(x, y, name, socket, color){
    this.x = x; // world pos
    this.y = y; // world pos
    this.reach = PLAYER_REACH;
    this.color = color;
    this.name = name; // username
    this.socket = socket; // websocket of the current session
    this.subscriptions = []; // the chunks which are having updates sent to this client
    this.resubscribePosition = {x, y};
    this.chunkUpdates = []; // the chunks which will be sent to this client as a whole
    this.changeObj = {}; // the terrain updates that the client actually needs
    this.lastEventId = '0';
    this.changedx = false;
    this.changedy = false;
    this.changedReach = false;
    this.changedColor = false;
    this.inventory = new Inventory();
  }

  playerBlock(){
    return 'P'+this.color;
  }


}

exports.Player = Player;
