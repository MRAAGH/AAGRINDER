/*
Server actions.

If the server changed a set of blocks, syncher.serverChangeBlocks must be called.

Please do not call the same method of Syncher or Subscribe several times in one action.
Because it is ugly and potentially slow.

Do not modify chunks directly! It must go through the Syncher!
May modify player inventory and position directly.

*/

class Actions {

  constructor(blockAt, syncher, resubscribe){
    this.blockAt = blockAt;
    this.syncher = syncher;
    this.resubscribe = resubscribe;
  }

  login(playerName, socket) {
    let player = new Player(128, 128, playerName, socket);
    this.players.push(player);
    subscribe.resubscribe(player);
  }

  logout(socket){
    for(let i = 0; i < this.players.length; i++){
      if(this.players[i].socket.id == socket.id){
        this.players.splice[i];
        return;
      }
    }
    console.log('Player socket not found: ' + socket.id);
  }

  teleport(playerName, x, y){
    let player = this.playerByName(playerName);
    player.x = x;
    player.y = y;
    subscribe.resubscribe(player);
  }
}
