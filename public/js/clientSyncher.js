
/*
Synching client with server.
All terrain-changing things must go through here.
Sends local events to the server, together with an id.
Receives from the server events caused by other players and the
server itself.

Keeps local events in a stack.
Corrects order when server events are received by
undoing local events and then redoing them.

Local events can become invalid when attempting to reapply them.
If that happens, we ignore those events. The server does the same.
*/

"use strict";
class Syncher {
  constructor(map, player, socket){
    this.map = map;
    this.player = player;
    this.actions = []; // a list of actions which have yet to be confirmed by server
    this.branch = 0;
    this.socket = socket;
    this.lastServerEventId = '0';
  }

  createView(){
    return new View(this, this.player);
  }


  action(name, data, changes){ // player action (movement, placement, diggment, interaction)
    let actionId = this.actions.length;
    for(let b of changes.b){
      const x = b.x + this.player.x;
      const y = b.y + this.player.y;
      b.p = this.map.getBlock(x, y);
      this.map.setBlock(x, y, b.b);
    }
    this.player.x += changes.px;
    this.player.y += changes.py;
    changes.r = true;

    this.actions.push(changes);

    let emittedAction = {
      a: name,
      i: actionId,
      d: data,
    };
    this.socket.emit('a', emittedAction);
  }

  applyTerrainUpdate(data){ // this is the core

    // apply block updates
    if(data.b){
      const action = {
        b: [],
        px: 0,
        py: 0,
      };
      for(const y of Object.getOwnPropertyNames(data.b)){
        for(const x of Object.getOwnPropertyNames(data.b[y])){
          action.b.push({
            x: x,
            y: y,
            b: data.b[y][x],
            p: this.map.getBlock(x, y),
          });
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

  applyPlayerUpdate(data){
    this.actions.push({
      px: data.x - this.player.x,
      py: data.y - this.player.y,
      b: [],
      r: false,
    });
    this.player.x = data.x;
    this.player.y = data.y;
    this.player.reach = data.reach;
  }


  rollback(branch, index){
    this.branch = branch;
    for(let i = this.actions.length-1; i >= index; i--){
      const acti = this.actions[i];
      console.log('undo ', acti);
      for(const blockChange of acti.b){
        const x = acti.r ? this.player.x + blockChange.x : blockChange.x;
        const y = acti.r ? this.player.y + blockChange.y : blockChange.y;
        this.map.setBlock(x, y, blockChange.p);
      }
      this.player.x -= acti.px;
      this.player.y -= acti.py;
    }
    for(let i = index+1; i < this.actions.length; i++){
      const acti = this.actions[i];
      console.log('redo ', acti);
      for(const blockChange of acti.b){
        const x = acti.r ? this.player.x + blockChange.x : blockChange.x;
        const y = acti.r ? this.player.y + blockChange.y : blockChange.y;
        this.map.setBlock(x, y, blockChange.r);
      }
      this.player.x -= acti.px;
      this.player.y -= acti.py;
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
    return this.syncher.map.getBlock(x+this.player.x,y+this.player.y);
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
