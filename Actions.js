/*
 * Player actions and server actions.
 *
 * this is the game logic, determines how things move and interact.
 *
 * with the abstractions provided by the Syncher class, there is no need
 * to worry about client-server synchronization, order of events,
 * missing pieces of terrain etc.
 * In this class we work on a high level.
 *
 * Notice "sharedActionFunctions". That's code that comes from a shared file
 * and it determines those parts of the game logic that the client also uses.
 * This way, I literally use the same code on the server and the client.
 * It is more maintainable this way.
 */

require('./shared/gameLogic.js');

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
