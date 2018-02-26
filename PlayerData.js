/*

PlayerData is the class holding everything about the players that needs to get saved to disk
and loaded from disk.

It also acts as an abstraction over players,
so that new players are handled gracefully (so long as they are registered)
If the player does not exist in this world, they are added at coordinates null, null
with empty inventory.
*/

const User = require('./schemes/UserScheme.js');
const Player = require('./Player').Player;
const bcrypt = require('bcryptjs');

class PlayerData {
  constructor(){
    this.onlinePlayers = [];
    this.knownPlayers = [];
  }

  login(name, password, socket){

    // first, verify password

    return new Promise((resolve, reject) => {
      User.findOne({ name: name }, (err, user) => {
        if(err){
          return reject('Server error');
        }
        if(!user){
          return reject('User does not exist. Try /register');
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.log('Failed to compare password!');
            return reject('Server error');
          }
          if(!isMatch){
            return reject('Wrong password');
          }

          // okay password is ok
          // does this player exist in this world?

          let knownPlayer = this.knownPlayerByName(name);

          if (knownPlayer){
            // player exists. Is this player already online?

            if (this.onlinePlayerByName(name)){
              return reject('Already online');
            }
            else{
              // looks good
              knownPlayer.socket = socket;
              this.onlinePlayers.push(knownPlayer);
              return resolve(knownPlayer);
            }
          }
          else{
            // player does not exist and needs to be added.

            let newPlayer = new Player(null, null, name, socket);
            this.knownPlayers.push(newPlayer);
            this.onlinePlayers.push(newPlayer);
            return resolve(newPlayer);
          }

        });
      });
    });
  }

  logout (socket){
    for(let i = 0; i < this.onlinePlayers.length; i++){
      if(this.onlinePlayers[i].socket.id === socket.id){
        let player = this.onlinePlayers[i];
        this.onlinePlayers.splice(i, 1);
        return player;
      }
    }
    return null;
  }

  knownPlayerByName(name){
    for(let i = 0; i < this.knownPlayers.length; i++){
      if(this.knownPlayers[i].name === name){
        return this.knownPlayers[i];
      }
    }
    return null;
  }

  onlinePlayerByName(name){
    for(let i = 0; i < this.onlinePlayers.length; i++){
      if(this.onlinePlayers[i].name === name){
        return this.onlinePlayers[i];
      }
    }
    return null;
  }
}

exports.PlayerData = PlayerData;
