
const express = require('express');
const router = express.Router();

const User = require('../schemes/UserScheme.js');

const SALT_WORK_FACTOR = 10;

router.post('/register', (req, res) => {
  if(
    req.body.name === undefined
    || typeof(req.body.name) !== 'string'
    || req.body.password === undefined
    || typeof(req.body.password) !== 'string'
  ){
    res.json({ message: 'Missing form data', success: false });
    return;
  }


  if(
    !/^[A-Za-z]([A-Za-z0-9 ]{0,10}[A-Za-z0-9])?$/.test(req.body.name);
  ){
    res.json({ message: 'Username invalid ^[A-Za-z]([A-Za-z0-9 ]{0,10}[A-Za-z0-9])?$', success: false });
    return;
  }

  if(
    !/^([A-Za-z0-9 ]{3,})?$/.test(req.body.password);
  ){
    res.json({ message: 'Password invalid', success: false });
    return;
  }

  User.findOne({ name: req.body.name }, (err, exist) => {
    if (exist && !err) {
      res.json({ message: 'Username taken', success: false });
    }
    else {
      let user = new User();
      user.name = req.body.name;
      user.password = req.body.password;
      user.color = 'blue';

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

          user.save((err) => {
            if (err) {
              console.log('Failed to save user!')
              res.json({ message: 'Server error', success: false });
              return;
            }
            else {
              res.json({ message: 'User created', success: true });
            }
          }
        });
      });
    }
  }
}
