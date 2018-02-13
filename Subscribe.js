
/*
Makes sure that the clients are getting updates for exactly those chunks they can see.
*/

const CHUNK_PROBES = [
  {x: +64, y: +96},
  {x: -64, y: +96},
  {x: +64, y: -96},
  {x: -64, y: -96}
]

class Subscribe{
  constructor(map){
    this.map = map;
    this.playerLists = {};
  }

  subscribe(player, chunkx, chunky){
    console.log('sub '+player.name+' '+chunkx+' '+chunky)
    player.subscriptions.push({x:chunkx, y:chunky});
    let chunk = this.map.getChunk(chunkx, chunky); // and generate if necessary
    chunk.subscribers.push(player);
  }

  unsubscribe(player, chunkx, chunky){
    console.log('unsub '+player.name+' '+chunkx+' '+chunky)
    for(let i = 0; i < player.subscriptions.length; i++){
      if(player.subscriptions[i].x == chunkx && player.subscriptions[i].y == chunky){
        player.subscriptions.splice(i, 1);
        break;
      }
    }
    let chunk = this.map.getChunk(chunkx, chunky);
    for(let i = 0; i < chunk.subscribers.length; i++){
      if(chunk.subscribers[i].name == player.name){
        chunk.subscribers.splice(i, 1);
        break;
      }
    }
  }

  resubscribe(player){
    console.log('resub '+player.name)
    let newSubscriptions = [];
    for(let p = 0; p < CHUNK_PROBES.length; p++){
      let chunkx = Math.floor((player.x + CHUNK_PROBES[p].x)/256);
      let chunky = Math.floor((player.y + CHUNK_PROBES[p].y)/256);
      // check if we found a new one
      let yes = true;
      for(let i = 0; i < newSubscriptions.length; i++){
        if(newSubscriptions[i].x == chunkx && newSubscriptions[i].y == chunky){
          yes = false;
          break;
        }
      }
      if(yes){
        newSubscriptions.push({x: chunkx, y: chunky});
      }
    }
    // console.log(newSubscriptions)

    for(let j = 0; j < player.subscriptions.length; j++){
      // is this a lost subscription?
      let yes = true;
      for(let i = 0; i < newSubscriptions.length; i++){
        if(
          newSubscriptions[i].x == player.subscriptions[j].x
          && newSubscriptions[i].y == player.subscriptions[j].y
        ){
          yes = false;
          break;
        }
      }
      if(yes){
        // lostSubscriptions.push(newSubscriptions[i]);
        this.unsubscribe(player, player.subscriptions[j].x, player.subscriptions[j].y);
      }
    }

    for(let i = 0; i < newSubscriptions.length; i++){
      // is this a fresh subscription?
      let yes = true;
      for(let j = 0; j < player.subscriptions.length; j++){
        if(
          newSubscriptions[i].x == player.subscriptions[j].x
          && newSubscriptions[i].y == player.subscriptions[j].y
        ){
          yes = false;
          break;
        }
      }
      if(yes){
        // freshSubscriptions.push(newSubscriptions[i]);
        this.subscribe(player, newSubscriptions[i].x, newSubscriptions[i].y);
      }
    }
    // console.log(player.subscriptions)
  }


}

exports.Subscribe = Subscribe;
