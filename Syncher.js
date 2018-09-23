
/*
Synching clients and server.
All terrain-changing things must go through here.
Sends to players the terrain updates they need, when they need them.
If a player does an invalid action (hack) or there are synching issues,
the Syncher requests the client to rollback to a previous state
and ignores that client's actions until the rollback has been confirmed.

Before the Action class methods are called for player actions,
call Syncher's method to see if this is a player we are listening to.
Might be a hacker. In which case, ignore the action.
*/

class Syncher{
  constructor(map, playerData){
    this.map = map;
    this.playerData = playerData;
  }

  createView(player){
    return new View(this, player);
  }

  checkHacker(socket){
    let player = this.map.playerBySocketId(socket.id);
    return player.hacker;
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
      // chunk.subscribers[j].changeList.push({x: changeList[i].x, y:changeList[i].y});
    }
  }

  sendUpdatesToClients(){
    for(let i = 0; i < this.playerData.onlinePlayers.length; i++){
      let player = this.playerData.onlinePlayers[i];
      this.sendUpdatesToClient(player);
    }
  }

  sendUpdatesToClient(player){
    let message = {};
    if (Object.keys(player.changeObj).length){
      message.b = player.changeObj;
    }

    let chunkUpdates = [];
    for(let i = 0; i < player.chunkUpdates.length; i++){
      console.log('chunk update!')
      let chunkx = player.chunkUpdates[i].x;
      let chunky = player.chunkUpdates[i].y;
      let str = this.map.getChunk(chunkx, chunky).getCompressed();
      chunkUpdates.push({
        x: chunkx,
        y: chunky,
        t: str
      });
    }

    if(chunkUpdates.length > 0){
      message.c = chunkUpdates;
    }
    player.changeObj = {};
    player.chunkUpdates = [];

    if(player.hacker){
      message.h = {i: player.hackedAt, b: player.branch};
    }
    if(Object.keys(message).length){
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
    this.touched = [];
    this.playerMovement = {x:0,y:0};
    this.rejected = false;
  }
  setBlock(x, y, b){
    this.queue.push({x:x,y:y,block:b});
    this.touched.push({x:x,y:y});
  }
  getBlock(x, y){
    this.touched.push({x:x,y:y});
    return this.syncher.map.getBlock(x,y);
  }
  movePlayerX(dist){
    this.playerMovement.x += dist;
  }
  movePlayerY(dist){
    this.playerMovement.y += dist;
  }
  apply(){
    if(this.rejected){
      return false;
    }
    for(const t of this.touched){
      if(this.player.changeObj[t.y] && this.player.changeObj[t.y][t.x]){
        // collision! abort abort abort
        return false;
      }
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
