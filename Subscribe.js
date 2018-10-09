
/*
Makes sure that the clients are getting updates for exactly those chunks they can see.
TODO: chunk probes are probably a bad idea and should be substituted by different logic. And the area needs to be bigger. And, oh, may I mention that this doesn't even work? Sometimes I find unloaded chunks.
*/

const LOAD_DISTANCE = 1; // chunks of at most this distance away from the player's chunk are loaded.
const UNLOAD_DISTANCE = 2; // chunks further than this distance away from the player's chunk are unloaded.

// const CHUNK_PROBES = [
//   {x: +64, y: +96},
//   {x: -64, y: +96},
//   {x: +64, y: -96},
//   {x: -64, y: -96}
// ];

class Subscribe{
  constructor(map){
    this.map = map;
    this.playerLists = {};
  }

  subscribe(player, chunkx, chunky){
    console.log('sub '+player.name+' '+chunkx+' '+chunky);
    player.subscriptions.push({x:chunkx, y:chunky});
    player.chunkUpdates.push({x:chunkx, y:chunky});
    const chunk = this.map.getChunk(chunkx, chunky); // and generate if necessary
    chunk.subscribers.push(player);
  }

  unsubscribe(player, chunkx, chunky){
    for(let i = 0; i < player.subscriptions.length; i++){
      if(player.subscriptions[i].x == chunkx && player.subscriptions[i].y == chunky){
        this.unsubscribeIndex(player, i);
        break;
      }
    }
  }

  unsubscribeIndex(player, index){
    const chunkx = player.subscriptions[index].x;
    const chunky = player.subscriptions[index].y;
    console.log('unsub '+player.name+' '+chunkx+' '+chunky);
    player.subscriptions.splice(index, 1);
    const chunk = this.map.getChunk(chunkx, chunky);
    for(let i = 0; i < chunk.subscribers.length; i++){
      if(chunk.subscribers[i].name == player.name){
        chunk.subscribers.splice(i, 1);
        break;
      }
    }
  }

  resubscribe(player, force = false){
    const distance = Math.abs(player.resubscribePosition.x - player.x) + Math.abs(player.resubscribePosition.y - player.y);
    if(distance < 128 && !force){
      // The player has hardly moved, no point in resubscribing now
      return;
    }
    // Update position of last resubscribe
    player.resubscribePosition.x = player.x;
    player.resubscribePosition.y = player.y;

    // Determine which chunk the player is in:
    const chunkPosX = Math.floor(player.x / 256);
    const chunkPosY = Math.floor(player.y / 256);

    // Unsubscribe from chunks which are too far:
    for (let c = player.subscriptions.length - 1; c >= 0; c--){
      const chunkx = player.subscriptions[c].x;
      const chunky = player.subscriptions[c].y;
      if(chunkx < chunkPosX-UNLOAD_DISTANCE
        || chunkx > chunkPosX+UNLOAD_DISTANCE
        || chunky < chunkPosY-UNLOAD_DISTANCE
        || chunky > chunkPosY+UNLOAD_DISTANCE){
        // this chunk is too far away
        this.unsubscribeIndex(player, c);
      }
    }

    // Subscribe to chunks which are by the player
    // (unless already subscribed)
    for (let i = chunkPosY-LOAD_DISTANCE; i <= chunkPosY+LOAD_DISTANCE; i++){
      for (let j = chunkPosX-LOAD_DISTANCE; j <= chunkPosX+LOAD_DISTANCE; j++){
        // check if this subscription exists already
        let exists = false;
        for (const s of player.subscriptions){
          if(s.x === j && s.y === i){
            exists = true;
            break;
          }
        }
        if(exists){
          continue;
        }
        // subscription does not exist. Subscribe:
        this.subscribe(player, j, i);
      }
    }
  }

  unsubscribeAll(player){
    for(let i = player.subscriptions.length-1; i>=0; i--){
      this.unsubscribeIndex(player, i);
    }
  }
}

exports.Subscribe = Subscribe;
