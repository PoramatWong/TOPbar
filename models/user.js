const   mongoose = require('mongoose');
        passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    name     : String,
    fullName : String,
    email    : String,
    phone    : String,
    address  : String,
    profileImage : String,
    isAdmin  : {type: Boolean, default: false}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);