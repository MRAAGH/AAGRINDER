/*
Server actions.

If the server changed a set of blocks, syncher.serverChangeBlocks must be called.

Please do not call the same method of Syncher or Subscribe several times in one action.
Because it is ugly and potentially slow.

Do not modify chunks directly! It must go through the Syncher!
May modify player inventory and position directly.

*/

class ServerActions {

  constructor(blockAt, syncher, resubscribe){
    this.blockAt = blockAt;
    this.syncher = syncher;
    this.resubscribe = resubscribe;
  }


  
}

exports.ServerActions = ServerActions;
