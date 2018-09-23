
/*
Synching client with server.
All terrain-changing things must go through here.
Sends to the server local terrain changes.
Receives from the server terrain changes caused by
other players and the server itself.

Handles server's request that the client needs to be rolled back.
This happens if this client's action interferes with an action by the server
or by another player.
Another case when that might happen is if the player is trying to hack :P

Note that the server does not always detect interference.
If the client makes an action while a server update is traveling over the internet,
the server will not notice interferences and the client might get desynched.
*/
"use strict";
class Syncher {
  constructor(map, player, socket){
    this.map = map;
    this.player = player;
    this.actions = []; // a list of actions which have yet to be confirmed by server
    this.branch = 0;
    this.socket = socket;
  }

  createView(){
    return new View(this, this.player);
  }


  action(name, data, changes){ // player action (movement, placement, diggment, interaction)
    let actionId = this.actions.length;
    for(let b of changes.b){
      b.p = this.map.getBlock(b.x, b.y);
      this.map.setBlock(b.x, b.y, b.b);
    }
    this.player.x += changes.px;
    this.player.y += changes.py;

    this.actions.push(changes);

    let action = {
      a: name,
      i: actionId,
      d: data,
    };
    this.socket.emit('a', action);
  }

  applyTerrainUpdate(data){ // this is the core


    // apply block updates
    if(data.b){
      for(const y of Object.getOwnPropertyNames(data.b)){
        for(const x of Object.getOwnPropertyNames(data.b[y])){
          this.map.setBlock(x, y, data.b[y][x]);
        }
      }
    }

    // apply chunk updates
    if(data.c){
      for(let i = 0; i < data.c.length; i++){
        this.map.loadChunk(data.c[i].x, data.c[i].y, data.c[i].t);
      }
    }
  }
}

class View{
  constructor(syncher, player){
    this.syncher = syncher;
    this.player = player;
    this.queue = [];
    this.playerMovement = {x:0,y:0};
    this.rejected = false;
  }
  setBlock(x, y, b){
    this.queue.push({x:x,y:y,b:b});
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
  apply(name, data){
    if(this.rejected){
      return false;
    }
    let changes = {b : this.queue,
      px : this.playerMovement.x,
      py : this.playerMovement.y,
    };
    this.syncher.action(name, data, changes);
    return true;
  }
  reject(){
    this.rejected = true;
  }
}
