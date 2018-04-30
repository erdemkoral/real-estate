const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const RequiredString = {
    type: String,
    required: true
};

const userSchema = new Schema ({
    name: RequiredString,
    email: RequiredString,
    hash: RequiredString,
    listings: [{
        type: Schema.Types.ObjectId,
        ref: 'Listing'
    }]
});

userSchema.statics.emailExists = function(email){
    return this.find({email})
        .count()
        .then(count => count > 0);
};

userSchema.methods.generateHash = function(password) {
    this.hash = bcrypt.hashSync(password, 7);
};

userSchema.methods.comparePassword = function(pass) {
    return bcrypt.compareSync(pass, this.hash);
};

module.exports = mongoose.model('User', userSchema);