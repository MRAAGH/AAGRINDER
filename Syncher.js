
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
  constructor(map){
    this.map = map;
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
    this.map.setBlock(x, y, block)
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
      playerChangeBlock(player, changeList[i].x, changeList[i].y, changeList[i].block);
    }
  }
  playerChangeBlock(player, x, y, block){
    this.map.setBlock(x, y, block)
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
    for(let i = 0; i < this.map.players.length; i++){
      let player = this.map.players[i];
      sendUpdatesToClient(player);
    }
  }

  sendUpdatesToClient(player){
    let message = {
      b: player.changeObj, // block updates
    }

    let chunkUpdates = [];
    for(let i = 0; i < player.chunkUpdates.length; i++){
      let chunkx = player.chunkUpdates[i].x;
      let chunky = player.chunkUpdates[i].y;
      let str = map.getChunk(chunkx, chunky);
      chunkUpdates.push({
        x: chunkx,
        y: chunky,
        t: str
      });
    }

    if(chunkUpdates.length > 0){
      message.c = chunkUpdates;
    }

    if(player.hacker){
      message.h = {i: player.hackedAt, b: player.branch};
    }

    player.socket.emit("t", message);
  }
}

exports.Syncher = Syncher;
