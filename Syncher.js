
/*
Synching clients and server.
All terrain-changing things must go through here.
Sends to players the terrain updates they need, when they need them.
If a player does an invalid action (hack) or there are synching issues,
the Syncher requests the client to rollback to a previous state
and ignores that client's actions until the rollback has been confirmed.

Before the Action class methods are called for player actions,
call Syncher's method to see if this is a player we are listening to.
Might be a hacker.
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
      this.map.setBlock(changeList[i].x, changeList[i].y, changeList[i].block)
      let chunkx = Math.floor(changeList[i].x/256);
      let chunky = Math.floor(changeList[i].y/256);
      let chunk = this.map.getChunk(chunkx, chunky);
      for(let j = 0; j < chunk.subscribers.length; j++){
        if(!chunk.subscribers[j].changeObj[changeList[i].y]){
          chunk.subscribers[j].changeObj[changeList[i].y] = {};
        }
        chunk.subscribers[j].changeObj[changeList[i].y][changeList[i].x] = changeList[i].block;
      }
    }
  }

  playerChangeBlocks(player, changeList){
    for(let i = 0; i < changeList.length; i++){
      this.map.setBlock(changeList[i].x, changeList[i].y, changeList[i].block)
      let chunkx = Math.floor(changeList[i].x/256);
      let chunky = Math.floor(changeList[i].y/256);
      let chunk = this.map.getChunk(chunkx, chunky);
      for(let j = 0; j < chunk.subscribers.length; j++){
        if(player.name == chunk.subscribers[j].name){
          continue;
        }
        if(!chunk.subscribers[j].changeObj[changeList[i].y]){
          chunk.subscribers[j].changeObj[changeList[i].y] = {};
        }
        chunk.subscribers[j].changeObj[changeList[i].y][changeList[i].x] = changeList[i].block;
        // chunk.subscribers[j].changeList.push({x: changeList[i].x, y:changeList[i].y});
      }
    }
  }

  sendUpdatesToClients(){
    for(let i = 0; i < this.map.players.length; i++){
      let player = this.map.players[i];

      let message = {
        b: player.changeObj, // block updates
      }

      let chunkUpdates = [];
      for(let i = 0; i < player.chunkUpdates.length; i++){
        let chunkx = player.chunkUpdates[i].x;
        let chunky = player.chunkUpdates[i].y;
        letsdgggfggf
      }
    }
  }
}

exports.Syncher = Syncher;
