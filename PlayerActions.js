/*
Player actions.

If a player moved, resubscribe must be called.
If a player changed a set of blocks, syncher.playerChangeBlocks must be called.
// If a player inventory changed, syncher.changeInventory must be called.
If the server changed a set of blocks, syncher.serverChangeBlocks must be called.

Do not modify chunks directly! It must go through the Syncher!
May modify player inventory and position directly.
Because we are not synching those between clients.

*/

class PlayerActions {

  constructor(map, syncher, subscribe, spawn){
    this.map = map;
    this.syncher = syncher;
    this.subscribe = subscribe;
    this.spawn = spawn;
  }

  login(player) {
    let spawnSpot = this.spawn.choosePlayerSpawnSpot(player);

    console.log(spawnSpot)

    // we assume this is a good spot and no checks need to be performed.

    this.syncher.playerChangeBlocks()

    this.subscribe.resubscribe(player);
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

exports.PlayerActions = PlayerActions;
