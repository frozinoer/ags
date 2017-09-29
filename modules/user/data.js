const _ = require('lodash');

const mongoose = require('mongoose');
const Promise = require("bluebird");
mongoose.Promise = Promise;
var Schema = mongoose.Schema;

var UserSchema = new Schema({

	name: {type: String, required:true},
    lastUrlParameters: String,

    filterParams: {
        spokenLanguageBlacklist: [String],
        regexBlacklist: [String],
        countryAlpha2Blacklist: [String],
        maxNights: Number,
        descriptionLanguageBlacklist: [String]
    },

    searchParams: {
        location: {type: String, required:true},
        days: {type: Number, required:true},
        minAge: Number,
        maxAge: Number,
        numGuests: Number,
        gender: String
    },


    slackParams: {
        webhookUrl: {type: String, required:true}
    }

});

User = mongoose.model('User', UserSchema);

exports.User = User;

exports.update = user => {
    return user.save();
}
