
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('../schemes/UserScheme.js');

const SALT_WORK_FACTOR = 10;

router.post('/register', (req, res) => {
  if(
    typeof(req.body.name) !== 'string'
    || typeof(req.body.password) !== 'string'
  ){
    res.json({ message: 'Missing form data', success: false });
    return;
  }


  if(
    // !/^[a-z]([a-z0-9 ]{0,10}[a-z0-9])?$/.test(req.body.name)
    !/^[A-Za-z]([A-Za-z0-9 ]{0,10}[A-Za-z0-9])?$/.test(req.body.name)
  ){
    // res.json({ message: 'Username invalid ^[a-z]([a-z0-9 ]{0,10}[a-z0-9])?$', success: false });
    res.json({ message: 'Username invalid ^[A-Za-z]([A-Za-z0-9 ]{0,10}[A-Za-z0-9])?$', success: false });
    return;
  }

  if(
    // !/^[a-z0-9 ]{3,}$/.test(req.body.password)
    !/^[A-Za-z0-9 ]{3,}$/.test(req.body.password)
  ){
    // res.json({ message: 'Password invalid ^[a-z0-9 ]{3,}$', success: false });
    res.json({ message: 'Password invalid ^[A-Za-z0-9 ]{3,}$', success: false });
    return;
  }

  User.findOne({ name: req.body.name }, (err, existingUser) => {
    if (err) {
      res.json({ message: 'Server error', success: false });
      return;
    }
    if (existingUser) {
      res.json({ message: 'Username taken', success: false });
      return;
    }
    else {
      let user = new User();
      user.name = req.body.name;
      user.password = '';
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
              res.json({ message: 'User created' + (user.name === 'sorunome' ? '. Hi there, soru O.O' : ''), success: true });
            }
          });
        });
      });
    }
  });
});

module.exports = router;
