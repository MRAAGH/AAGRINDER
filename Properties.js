/*
 * Some very ugly code for loading data from server.properties
 */

const fs = require('fs');

loadServerProperties = function(callback){
  //Check if file exists
  if (fs.existsSync('server.properties')) {
    fs.readFile('server.properties', function (err, loadedString) {
      if (err) console.log(err);
      else {
        const loaded_properties = JSON.parse(loadedString);
        let bad_file_format = false;
        if (loaded_properties.level_name == undefined) {
          loaded_properties.level_name = 'world';
          bad_file_format = true;
        }
        if (loaded_properties.seed == undefined) {
          loaded_properties.seed = Math.floor(Math.random() * 65536);
          bad_file_format = true;
        }
        if (loaded_properties.database_username == undefined) {
          loaded_properties.database_host = 'localhost';
          bad_file_format = true;
        }
        if (loaded_properties.database_username == undefined) {
          loaded_properties.database_username = 'root';
          bad_file_format = true;
        }
        if (loaded_properties.database_password == undefined) {
          loaded_properties.database_password = '';
          bad_file_format = true;
        }
        if (loaded_properties.database_name == undefined) {
          loaded_properties.database_name = 'aagrinder';
          bad_file_format = true;
        }
        if (bad_file_format) {
          const corrected_properties_string = JSON.stringify(loaded_properties);
          fs.writeFile('server.properties', corrected_properties_string, function (err) {
            if (err) console.log(err);
            else {
              callback(loaded_properties);
            }
          });
        }
        else {
          callback(loaded_properties);
        }
      }
    });
  }
  else {
    loaded_properties = {
      level_name: 'world',
      seed: Math.floor(Math.random() * 65536),
      database_host: 'localhost',
      database_username: 'root',
      database_password: '',
      database_name: 'aagrinder'
    };
    const corrected_properties_string = JSON.stringify(loaded_properties);
    fs.writeFile('server.properties', corrected_properties_string, function (err) {
      if (err) console.log(err);
      else {
        callback(loaded_properties);
      }
    });
  }
}
