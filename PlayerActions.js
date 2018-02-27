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

    console.log(spawnSpot);

    // we assume this is a good spot and no checks need to be performed.

    player.x = spawnSpot.x;
    player.y = spawnSpot.y;

    // verify that player color is ok ... if it is not, this'll break everything
    if(!/^[0-9abcdef]{6}$/.test(player.color)){
      player.color = 'ffffff';
    }

    this.syncher.playerChangeBlock(player, player.x, player.y, 'P' + player.color);

    this.subscribe.resubscribe(player);

    // send player state to the client, becaue this is missing in terrain updates
    player.socket.emit('p', {
      x: player.x,
      y: player.y
    });
  }

  logout(player){
    this.syncher.playerChangeBlock(player, player.x, player.y, ' ');

    this.subscribe.unsubscribeAll(player);
  }

  teleport(playerName, x, y){
    let player = this.playerByName(playerName);
    player.x = x;
    player.y = y;
    subscribe.resubscribe(player);
  }
}

exports.PlayerActions = PlayerActions;
