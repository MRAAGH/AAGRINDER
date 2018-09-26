
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
    this.eventStack = []; // a list of actions which have yet to be confirmed by server
    this.branch = 0;
    this.socket = socket;
    this.lastServerEventId = '0';
  }

  createView(){
    return new View(this, this.player);
  }


  action(name, data, changes, silent=false){ // player action (movement, placement, diggment, interaction)
    let actionId = Base64.fromNumber(Date.now())+'|'+Base64.fromNumber(Math.floor(Math.random()*4096));
    for(let b of changes.b){
      const x = b.x + this.player.x;
      const y = b.y + this.player.y;
      b.p = this.map.getBlock(x, y);
      this.map.setBlock(x, y, b.b);
    }
    this.player.x += changes.px;
    this.player.y += changes.py;

    const event = {
      i: actionId,
      a: {
        a: name,
        d: data,
      },
      u: {
        b: changes.b,
        px: changes.px,
        py: changes.py,
      },
    }

    this.eventStack.push(event);

    if(silent){
      // not notifying the server
      return;
    }

    let emittedAction = {
      a: name,
      i: actionId,
      d: data,
    };
    this.socket.emit('a', emittedAction);
  }

  serverAction(data){

    // apply block updates
    if(data.b){
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

    if("px" in data){
      this.player.x == data.px;
    }
    if("py" in data){
      this.player.y == data.py;
    }
  }

  applyPlayerUpdate(data){
    this.player.x = data.x;
    this.player.y = data.y;
    this.player.reach = data.reach;
  }

  addPlayerActionsRef(playerActions){
    this.playerActions = playerActions;
  }

  serverEvent(event){
    const list = this.rollback(event.p);
    this.serverAction(event);
    this.lastServerEventId = event.l;
    this.eventStack = [];
    this.fastforward(list, this.playerActions);
  }

  rollback(index){
    const undoneActions = [];
    for(let i = this.eventStack.length-1; i >= 0; i--){
      const event = this.eventStack[i];
      if(event.i === index){
        // stop undoing because specified index was found
        break;
      }
      console.log('undo ', event);
      // put it in the list so it's possible to redo it later
      undoneActions.push(event.a);
      // undo every block change
      for(const blockChange of event.u.b){
        const x = this.player.x + blockChange.x;
        const y = this.player.y + blockChange.y;
        this.map.setBlock(x, y, blockChange.p);
      }
      this.player.x -= event.u.px;
      this.player.y -= event.u.py;
    }
  }

  fastforward(actionList, playerActions){
    for(action of actionList){
      console.log('redo', action);
      playerActions.action(action.a, action.d, true);
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
  apply(name, data, silent){
    if(this.rejected){
      return false;
    }
    let changes = {b : this.queue,
      px : this.playerMovement.x,
      py : this.playerMovement.y,
    };
    this.syncher.action(name, data, changes, silent);
    return true;
  }
  reject(){
    this.rejected = true;
  }
}
