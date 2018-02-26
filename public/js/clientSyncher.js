
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

class Syncher {
  constructor(map, player){
    this.map = map;
    this.player = player;
    this.actions = []; // a list of actions which have yet to be confirmed by server
    this.branch = 0;
  }

  action(action){ // player action (movement, placement, diggment, interaction)

  }

  applyTerrainUpdate(data){ // this is the core


    // apply block updates
    if(data.b){

    }

    // apply chunk updates
    if(data.c){
      for(let i = 0; i < data.c.length; i++){
        this.map.loadChunk(data.c[i].x, data.c[i].y, data.c[i].t);
      }
    }
  }
}
