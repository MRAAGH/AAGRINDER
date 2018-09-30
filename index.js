const SERVER_VERSION = '0.0.1';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const md5 = require('md5');
const cron = require('node-cron');
const fs = require('fs');
const bodyParser = require('body-parser');
const mysql = require('mysql');

require('./Properties.js');
// const mongoose = require('bluebird').promisifyAll(require('mongoose'));
// const mongoose = require('mongoose');
// mongoose.Promise = require('bluebird');

// mongoose.connect('mongodb://localhost:27017/aagrinder', {useMongoClient: true});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));

app.use('/api/users', require('./routes/User'));



const Server = require('./Server').Server;

process.stdin.resume();
process.stdin.setEncoding('utf8');

const port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/shared'));

app.get('/aa', function (req, res) {
  const u = '/aa has been accessed.';
  console.log(JSON.stringify(u));
  res.json(u);
});


process.stdin.on('data', function (text) {
  server.command(text.trim());
});

/*
cron.schedule('0 * * * *', function () {
saveToFile();
});*/

console.log('Starting aagrinder server version ' + SERVER_VERSION);
const hrstart_server_load = process.hrtime();
loadServerProperties((props) => {
  // now we have database authentication things
  // the connection is a global variable atm
  connection = mysql.createConnection({
    host     : props.database_host,
    user     : props.database_username,
    password : props.database_password,
    database : props.database_name
  });
  connection.query(`
CREATE TABLE IF NOT EXISTS users (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(20) NOT NULL,
  password varchar(70) NOT NULL,
  color char(6) NOT NULL DEFAULT 'ffffff',
  PRIMARY KEY (id),
  UNIQUE KEY (name)
)
    `,()=>{
        server = new Server(props.level_name, props.seed, connection);
        console.log('Preparing level "' + props.level_name + '"');
        server.loadfromFile(() => {
        server.listen(http, io, port, function () {
          const hrend_server_load = process.hrtime(hrstart_server_load);
          console.log('Done (' + hrend_server_load[0] + '.' + Math.floor(hrend_server_load[1] / 1000000) + 's)!');
          console.log('AAGRINDER server listening on *:' + port);
        });
        // });
      })
  });
});
