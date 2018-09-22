
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const SALT_WORK_FACTOR = 10;

router.post('/register', (req, res) => {
  if(
    typeof(req.body.name) !== 'string'
    || typeof(req.body.password) !== 'string'
    || typeof(req.body.color) !== 'string'
  ){
    res.json({ message: 'Missing form data', success: false });
    return;
  }


  if(
    !/^[A-Za-z]([A-Za-z0-9 ]{0,10}[A-Za-z0-9])?$/.test(req.body.name)
  ){
    res.json({ message: 'Username invalid ^[A-Za-z]([A-Za-z0-9 ]{0,10}[A-Za-z0-9])?$', success: false });
    return;
  }

  if(
    !/^.{3,}$/.test(req.body.password)
  ){
    res.json({ message: 'Password invalid ^.{3,}$', success: false });
    return;
  }

  if(
    !/^[0-9abcdef]{6}$/.test(req.body.color)
  ){
    res.json({ message: 'Color invalid ^[0-9abcdef]{6}$', success: false });
    return;
  }

  {
    // check the color
    let r = parseInt(req.body.color.substring(0, 3), 16);
    let g = parseInt(req.body.color.substring(2, 5), 16);
    let b = parseInt(req.body.color.substring(4, 7), 16);

    if(r + g + b < 150){
      res.json({ message: 'Color too dark', success: false });
      return;
    }
  }



  connection.query('SELECT name FROM users WHERE name="' + req.body.name + '";', (err, existingUser, fields) => {
    if (err) {
      res.json({ message: 'Server error', success: false });
      return;
    }
    if (existingUser.length > 0) {
      res.json({ message: 'Username taken', success: false });
      return;
    }
    else {
      let user = {
        name: req.body.name,
        password: '',
        color: req.body.color
      }

      bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) {
          console.log('Failed to gen salt!')
          res.json({ message: 'Server error', success: false });
          return;
        }
        bcrypt.hash(req.body.password, salt, (err, hash) => {

          if (err) {
            console.log('Failed to hash password!')
            res.json({ message: 'Server error', success: false });
            return;
          }
          user.password = hash;

          connection.query(
            // 'INSERT INTO users VALUES ("aaa","aaa","00ff00");',
            'INSERT INTO users (name, password, color) VALUES ("' + user.name + '","' + user.password + '","' + user.color + '");',
            (err, existingUser, fields) => {
            if (err) {
              console.log('Failed to save user!')
              console.log(err)
              res.json({ message: 'Server error', success: false });
              return;
            }
            else {
              res.json({ message: 'User created' + (user.name === 'sorunome' ? '. Hi there, soru O.O' : ''), success: true });
            }
          });
        });
      });
    }
  });
});

module.exports = router;
