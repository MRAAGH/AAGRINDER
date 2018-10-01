# AAGRINDER
2D sanbox multiplayer game you can play in the browser

![aagrinder](https://img.ourl.ca/Screenshot_2018-09-30%20AAGRINDER%284%29.png "AAGRINDER")

![aagrinder](https://img.ourl.ca/Screenshot_2018-09-30%20AAGRINDER%282%29.png "AAGRINDER")

![aagrinder](https://img.ourl.ca/Screenshot_2018-09-30%20AAGRINDER%283%29.png "AAGRINDER")

# How can I play?
You need to know a link to an aagrinder server.

You just enter this link into your browser and start playing!
It is that simple! :D

# How to find a server?
I don't have a public server, and I don't know of any other servers.
I will probably set one up in the future.
Right now, I suggest waiting. Check back in a few months to see if this readme has changed.

# How to run a server?
You need a mysql database running, for storing account data.
This may change in the future if authentication becomes centralized,
and then you won't need your own database.

You need to install [node.js](https://nodejs.org/en/).

Then run the following commands:
```
$ git clone https://github.com/MRAAGH/aagrinder.git
$ cd aagrinder
$ npm install
$ npm start
```

A server.properties file will be created.
You should open it and set the properties to what you want, then restart the server.

You also need to configure ports and IP's if you want others to be able to connect.
If this confuses you, maybe you should find someone else to host the server ^.^

# How finished is the game?
Kind of unfinished and slightly unstable.

There is an inventory and crafting, but you can't move properly.

The server randomly crashes at times and when it does, the world is lost since you can't save it yet.
