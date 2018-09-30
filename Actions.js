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

require('./public/js/sharedGameLogic.js');

class Actions {

  constructor(map, syncher, subscribe, spawn){
    this.map = map;
    this.syncher = syncher;
    this.subscribe = subscribe;
    this.spawn = spawn;
    this.actionFunctions = sharedActionFunctions;
  }

  login(player) {

    const spawnSpot = this.spawn.choosePlayerSpawnSpot(player);

    console.log('spawnSpot');
    console.log(spawnSpot);

    // we assume this is a good spot and no checks need to be performed.

    player.x = spawnSpot.x;
    player.y = spawnSpot.y;

    // verify that player color is ok ... if it is not, this'll break everything
    if(!/^[0-9a-f]{6}$/.test(player.color)){
      player.color = 'ffffff';
    }

    this.syncher.playerChangeBlock(player, player.x, player.y, player.playerBlock());

    this.subscribe.unsubscribeAll(player);
    this.subscribe.resubscribe(player, true);

    player.changedx = true;
    player.changedy = true;
    player.changedReach = true;
    player.changedColor = true;
    player.changedInventory = true;

    this.syncher.sendUpdatesToClients();
  }

  logout(player){
    this.syncher.playerChangeBlock(player, player.x, player.y, ' ');

    this.subscribe.unsubscribeAll(player);

    this.syncher.sendUpdatesToClients();
  }

  teleport(playerName, x, y){
    const player = this.playerByName(playerName);
    player.x = x;
    player.y = y;
    subscribe.resubscribe(player);
  }

  action(player, actionName, data, eventId){
    if(this.actionFunctions[actionName]){
      const view = this.syncher.createView(player)
      this.actionFunctions[actionName](view, data);
      const success = view.apply();
      this.subscribe.resubscribe(player);
      player.lastEventId = eventId;
      return success;
    }
    return false;
  }
}

exports.Actions = Actions;
