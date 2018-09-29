
/*
Synching clients and server.
All terrain-changing, player position changing and inventory changing things
must go through here.

Synching on the server side is quite trivial: just keep track of indices.
Events happen in a determined order on the server.
Each event has an id, which was set by the creator of the event.
Clients are notified of each event visible to them (except for the one
client who triggered the event, as that one already knows about it).

Along with each event notification, we send its id and the id of the
previous event (ignoring those events irrelevant to the client).
We expect the client to correct the event order on its end
in case of desynchronization by undoing and redoing its own events.
If the client sends an invalid action (because its world was not
properly updated when the action was taken), we ignore the action.
We expect the client to do the same as soon as it finds out what
really happened.
*/

class Syncher{
  constructor(map, playerData){
    this.map = map;
    this.playerData = playerData;
  }

  createView(player){
    return new View(this, player);
  }

  serverChangeBlocks(changeList){
    for(let i = 0; i < changeList.length; i++){
      serverChangeBlock(player, changeList[i].x, changeList[i].y, changeList[i].block);
    }
  }
  serverChangeBlock(x, y, block){
    this.map.setBlock(x, y, block);
    let chunkx = Math.floor(x/256);
    let chunky = Math.floor(y/256);
    let chunk = this.map.getChunk(chunkx, chunky);
    for(let j = 0; j < chunk.subscribers.length; j++){
      if(!chunk.subscribers[j].changeObj[y]){
        chunk.subscribers[j].changeObj[y] = {};
      }
      chunk.subscribers[j].changeObj[y][x] = block;
    }
  }

  playerChangeBlocks(player, changeList){
    for(let i = 0; i < changeList.length; i++){
      this.playerChangeBlock(player, changeList[i].x, changeList[i].y, changeList[i].block);
    }
  }
  playerChangeBlock(player, x, y, block){
    this.map.setBlock(x, y, block);
    let chunkx = Math.floor(x/256);
    let chunky = Math.floor(y/256);
    let chunk = this.map.getChunk(chunkx, chunky);
    for(let j = 0; j < chunk.subscribers.length; j++){
      if(player.name == chunk.subscribers[j].name){
        // skip the player who is doing this
        // (this player doesn't need the update)
        continue;
      }
      if(!chunk.subscribers[j].changeObj[y]){
        chunk.subscribers[j].changeObj[y] = {};
      }
      chunk.subscribers[j].changeObj[y][x] = block;
    }
  }

  sendUpdatesToClients(){
    for(let i = 0; i < this.playerData.onlinePlayers.length; i++){
      const player = this.playerData.onlinePlayers[i];
      this.sendUpdatesToClient(player);
    }
  }

  sendUpdatesToClient(player){
    let message = {};
    // block updates (if there are any)
    if (Object.keys(player.changeObj).length){
      message.b = player.changeObj;
    }

    console.log('mess ', message);

    // collect chunk updates
    let chunkUpdates = [];
    for(let i = 0; i < player.chunkUpdates.length; i++){
      console.log('chunk update!')
      let chunkx = player.chunkUpdates[i].x;
      let chunky = player.chunkUpdates[i].y;
      let str = this.map.getChunk(chunkx, chunky).getCompressed();
      chunkUpdates.push({
        x: chunkx,
        y: chunky,
        t: str,
      });
    }

    // chunk updates (if there are any)
    if(chunkUpdates.length > 0){
      message.c = chunkUpdates;
    }

    // player position updates (if there are changes)
    if(player.changedx){
      message.px = player.x;
    }
    if(player.changedy){
      message.py = player.y;
    }

    // player reach update (if applicable)
    if(player.changedReach){
      message.reach = player.reach;
    }

    // player color update (if applicable)
    if(player.changedColor){
      message.color = player.color;
    }

    // clear the lists of things to be sent
    player.changeObj = {};
    player.chunkUpdates = [];
    player.changedx = false;
    player.changedy = false;
    player.changedReach = false;
    player.changedColor = false;


    // send message (if there is anything in the message)
    if(Object.keys(message).length > 0){
      message.l = player.lastEventId;
      player.lastEventId = undefined; // undefined means it was a server action
      console.log('meees',message)
      player.socket.emit('t', message);
    }
  }
}

/*
A view provides easier interaction with the syncher.
Block checks and changes are automatically logged and queued
and applied at the correct moment.
*/

class View{
  constructor(syncher, player){
    this.syncher = syncher;
    this.player = player;
    this.queue = [];
    this.playerMovement = {x:0,y:0};
    this.rejected = false;
  }
  setBlock(x, y, b){
    this.queue.push({
      x:x+this.player.x+this.playerMovement.x,
      y:y+this.player.y+this.playerMovement.y,
      block:b,
    });
  }
  getBlock(x, y){
    return this.syncher.map.getBlock(x,y);
  }
  movePlayerX(dist){
    this.playerMovement.x += dist;
  }
  movePlayerY(dist){
    this.playerMovement.y += dist;
  }
  apply(eventId){
    if(this.rejected){
      return false;
    }
    this.player.x += this.playerMovement.x;
    this.player.y += this.playerMovement.y;
    this.syncher.playerChangeBlocks(this.player, this.queue);
    this.syncher.sendUpdatesToClients();
    return true;
  }
  reject(){
    this.rejected = true;
  }
}

exports.Syncher = Syncher;
