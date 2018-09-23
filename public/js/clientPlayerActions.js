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
    this.actionFunctions = sharedActionFunctions;
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
