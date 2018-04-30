const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requiredString = {
    type: String,
    required: true
};
const requiredNumber = {
    type: Number,
    required: true
};

const listingSchema = new Schema({
    street1: requiredString,
    street2: String,
    city: requiredString,
    state: requiredString,
    zipCode: requiredNumber,
    neighborhood: String,
    salesPrice : requiredNumber,
    dateListed : Date,
    bedrooms: Number,
    photos: String,
    bathrooms: Number,
    garageSize: Number,
    squareFeet: Number,
    lotSize: Number,
    description: String,
    date: String,
    postedBy:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

listingSchema.methods.generateDate = function () {
    this.date = new Date();
};

module.exports = mongoose.model('Listing', listingSchema);