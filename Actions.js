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

  constructor(map, syncher, subscribe, spawn, playerData){
    this.map = map;
    this.syncher = syncher;
    this.subscribe = subscribe;
    this.spawn = spawn;
    this.actionFunctions = sharedActionFunctions;
    this.playerData = playerData;
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

  executeCommand(player, typed){
    
    const args = typed.split(/ +/);

    switch(args[0]){
      case '/tp':

        if(args.length < 3 || args.length > 4){
          player.socket.emit('chat', {message: 'usage: /tp [player] <x> <y>'});
          break;
        }

        const tpPlayerName = args.length === 4 ? args[1] : player.name;
        const tpPlayer = this.playerData.onlinePlayerByName(tpPlayerName);

        let x = args.length === 4 ? args[2] : args[1];
        let y = args.length === 4 ? args[3] : args[2];

        const xrel = x[0] === '~';
        const yrel = y[0] === '~';

        if(xrel){
          x = x.substring(1);
          x = x === '' ? '0' : x;
        }
        if(yrel){
          y = y.substring(1);
          y = y === '' ? '0' : y;
        }

        if(isNaN(x) || isNaN(y) || !tpPlayer){
          player.socket.emit('chat', {message: 'usage: /tp [player] <x> <y>'});
          break;
        }

        let intx = xrel ? parseInt(x) + player.x : parseInt(x);
        let inty = yrel ? parseInt(y) + player.y : parseInt(y);

        const blockThere = this.syncher.getBlock(intx, inty);
        if(blockThere !== ' '){
          player.socket.emit('chat', {message: 'target position obstructed'});
          break;
        }

        const oldx = tpPlayer.x;
        const oldy = tpPlayer.y;

        tpPlayer.x = intx;
        tpPlayer.y = inty;

        tpPlayer.changedx = true;
        tpPlayer.changedy = true;
        
        this.subscribe.resubscribe(tpPlayer, true);

        this.syncher.serverChangeBlock(intx, inty, tpPlayer.playerBlock());
        this.syncher.serverChangeBlock(oldx, oldy, ' ');

        this.syncher.sendUpdatesToClients();

        break;

      case '/give':
        const recvPlayerName = args.length < 4 ? player.name : args[3];
        const amount = args.length < 3 ? '1' : args[2];
        const item = args.length < 2 ? 'noop' : args[1];

        // find target player
        const recvPlayer = this.playerData.onlinePlayerByName(recvPlayerName);

        // all fail cases
        if(isNaN(amount) || !player.inventory.itemCodeExists(item) || !recvPlayer){
          player.socket.emit('chat', {message: 'usage: /give <item> [amount] [player]'});
        }

        else{
          // nope didn't fail
          player.socket.emit('chat', {message: 'giving '+amount+' of '+item+' to '+recvPlayerName});
          const intAmount = parseInt(amount);
          if(recvPlayer.inventory.state[item] + intAmount < 0){
            // can't go negative
            recvPlayer.inventory.state[item] = 0;
          }
          else{
            recvPlayer.inventory.state[item] += intAmount;
          }
          //update properly
          recvPlayer.changedInventory = true;
          this.syncher.sendUpdatesToClient(recvPlayer);
        }

        break;

      case '/gamemode': case '/mode': case '/g': case '/m':
        break;

      case '/w': case '/whisper':
        break;
      case '/help': case '/?':
        player.socket.emit('chat', {message: 
'server commands: /tp /give /g /gamemode /m /mode /w /whisper /help /?'
        });
        break;
      default:
        console.log('invalid command: ', args[0]);
        player.socket.emit('chat', {message: 'unknown command: '+args[0]+'. Try /help'});
    }





  }

}

exports.Actions = Actions;
