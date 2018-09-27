/*

PlayerData is the class holding everything about the players that needs to get saved to disk
and loaded from disk.

It also acts as an abstraction over players,
so that new players are handled gracefully (so long as they are registered)
If the player does not exist in this world, they are added at coordinates null, null
with empty inventory.
*/

const Player = require('./Player').Player;
const bcrypt = require('bcryptjs');


class PlayerData {
  constructor(connection){
    this.onlinePlayers = [];
    this.knownPlayers = [];
    this.connection = connection;
  }

  login(name, password, socket){
    // this is my injection guard
    if(
      !/^[A-Za-z]([A-Za-z0-9 ]{0,10}[A-Za-z0-9])?$/.test(name)
    ){
      return Promise.reject('User does not exist. Try /register');
    }

    // verify password

    return new Promise((resolve, reject) => {
      this.connection.query('SELECT name, password, color FROM users WHERE name="' + name + '";', (err, foundUsers, fields) => {
        if(err){
          return reject('Server error');
        }
        if(foundUsers.length < 1){
          return reject('User does not exist. Try /register');
        }

        const user = foundUsers[0];
        console.log(user);

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
              knownPlayer.color = user.color;
              this.onlinePlayers.push(knownPlayer);
              return resolve(knownPlayer);
            }
          }
          else{
            // player does not exist and needs to be added.

            let newPlayer = new Player(null, null, name, socket, user.color);
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

  onlinePlayerBySocket(socket){
    for(let i = 0; i < this.onlinePlayers.length; i++){
      if(this.onlinePlayers[i].socket.id === socket.id){
        return this.onlinePlayers[i];
      }
    }
    return null;
  }
}

exports.PlayerData = PlayerData;
