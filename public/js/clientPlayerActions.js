/*
The game logic. This class determines how player movement works,
how to place and break blocks,
determines when these actions are allowed and when not.
And defines exactly what block changes happen after each action.

A list of block changes is sent to the Syncher, which applies these
changes and stores them in a stack, making rollback possible.

The Syncher also gets the action name and data (coordinates, specifiers ...)
and sends this to the server together with the internal action id.

Basically, this class here just defines what happens to the world after
world-changing buttons are pressed.
The player block and the player's coordinates are also part of the world.
But the hotbar, cursor and the whole terminal section are not.
*/

"use strict";

class PlayerActions{
  constructor(player, map, syncher){
    this.map = map;
    this.syncher = syncher;
    this.player = player;
    this.actionFunctions = {
      'l':(view, data)=>{
        view.setBlock(view.player.x, view.player.y, ' ');
        view.setBlock(view.player.x-1, view.player.y, view.player.playerBlock());
        view.movePlayerX(-1);
      },
      'r':(view, data)=>{
        view.setBlock(view.player.x, view.player.y, ' ');
        view.setBlock(view.player.x+1, view.player.y, view.player.playerBlock());
        view.movePlayerX(1);
      },
      'd':(view, data)=>{
        view.setBlock(view.player.x, view.player.y, ' ');
        view.setBlock(view.player.x, view.player.y-1, view.player.playerBlock());
        view.movePlayerY(-1);
      },
      'u':(view, data)=>{
        view.setBlock(view.player.x, view.player.y, ' ');
        view.setBlock(view.player.x, view.player.y+1, view.player.playerBlock());
        view.movePlayerY(1);
      },
      'D':(view, data)=>{
        let x, y;
        if(data.r){
          x = view.player.x + data.x;
          y = view.player.y + data.y;
        }
        else{
          x = data.x;
          y = data.y;
        }
        console.log(x,y)
        if(Math.abs(view.player.x - x) > view.player.reach
        || Math.abs(view.player.y - y) > view.player.reach){
          // should not be able to reach!
          view.reject();
          return;
        }
        // must be a diggable block
        const dug = view.getBlock(x, y);
        if(dug === ' ' || dug.substr(0, 1) === 'P'){
          view.reject();
          return;
        }
        // ok dig it
        view.setBlock(x, y, ' ');
        // TODO: should probably add it to the inventory ;)
      },
    };
  }

  action(actionName, data){
    if(this.actionFunctions[actionName]){
      const view = this.syncher.createView()
      this.actionFunctions[actionName](view, data);
      return view.apply(actionName, data);
    }
    return false;
  }

}
