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
    this.actionFunctions = {
      'l':(view, data)=>{
        view.setBlock(view.player.x, view.player.y, ' ');
        view.setBlock(view.player.x-1, view.player.y, view.player.playerBlock());
        view.movePlayerX(-1);
      },
      'r':(view, data)=>{
        view.setBlock(view.player.x, view.player.y, ' ');
        view.setBlock(view.player.x+1, view.player.y, view.player.playerBlock());
        view.movePlayerX(1);
      },
      'd':(view, data)=>{
        view.setBlock(view.player.x, view.player.y, ' ');
        view.setBlock(view.player.x, view.player.y-1, view.player.playerBlock());
        view.movePlayerY(-1);
      },
      'u':(view, data)=>{
        view.setBlock(view.player.x, view.player.y, ' ');
        view.setBlock(view.player.x, view.player.y+1, view.player.playerBlock());
        view.movePlayerY(1);
      },
    };
  }

  login(player) {

    const spawnSpot = this.spawn.choosePlayerSpawnSpot(player);

    console.log(spawnSpot);

    // we assume this is a good spot and no checks need to be performed.

    player.x = spawnSpot.x;
    player.y = spawnSpot.y;

    // verify that player color is ok ... if it is not, this'll break everything
    if(!/^[0-9abcdef]{6}$/.test(player.color)){
      player.color = 'ffffff';
    }

    this.syncher.playerChangeBlock(player, player.x, player.y, player.playerBlock());

    this.subscribe.resubscribe(player);

    // send player state to the client, becaue this is missing in terrain updates
    player.socket.emit('p', {
      x: player.x,
      y: player.y,
      reach: player.reach
    });
  }

  logout(player){
    this.syncher.playerChangeBlock(player, player.x, player.y, ' ');

    this.subscribe.unsubscribeAll(player);
  }

  teleport(playerName, x, y){
    const player = this.playerByName(playerName);
    player.x = x;
    player.y = y;
    subscribe.resubscribe(player);
  }

  action(player, actionName, data){
    if(this.actionFunctions[actionName]){
      const view = this.syncher.createView(player)
      this.actionFunctions[actionName](view, data);
      return view.apply();
    }
    return false;
  }
}

exports.PlayerActions = PlayerActions;
