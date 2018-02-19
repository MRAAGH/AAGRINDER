
const bcrypt = require('bcryptjs');
// const mongoose = require('mongoose');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
// const mongoose = require('bluebird').promisifyAll(require('mongoose'));
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String },
  password: { type: String },
  color: { type: String }
});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

var User = mongoose.model('User', UserSchema);

module.exports = User;
