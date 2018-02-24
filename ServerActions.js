/*
Server actions.

If the server changed a set of blocks, syncher.serverChangeBlocks must be called.

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
