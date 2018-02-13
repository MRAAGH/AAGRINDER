
/*
Synching clients and server.
All terrain-changing things must go through here.
Sends to players the terrain updates they need, when they need them.
If a player does an invalid action (hack) or there are synching issues,
the Syncher requests the client to rollback to a previous state
and ignores that client's actions until the rollback has been confirmed.

Before the Action class methods are called for player actions, 
*/

class Syncher{
  constructor(map){
    this.map = map;
  }



}

exports.Syncher = Syncher;
