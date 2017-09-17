const _ = require('lodash');

const mongoose = require('mongoose');
const Promise = require("bluebird");
mongoose.Promise = Promise;
var Schema = mongoose.Schema;

var TravelerSchema = new Schema({
    "id": {type: Number, required:true},
    "key": {type: String, required:true},
    "visitId": {type: String, required:true},
    "creationDate": {type: Date, required:true},
	"ignored": {type: Boolean, required:true},    
    "avatarUrl": {type: String, required:true},
    "publicName": {type: String, required:true},
    "isVerified": {type: Boolean, required:true},
    "totalReferencesCount": {type: Number, required:true},
    "friendsCount": {type: Number, required:true},
    "profileLink": {type: String, required:true},
    "languages": {
        "fluent": [
            {
                "code": {type: String, required:true},
                "name": {type: String, required:true}
            }
        ]
    },
    "country": {
    	"name": String,
    	"alpha2": String    	
    },
    "trip": {
        "arrival": {
            "monthDay": {type: String, required:true},
            "fullDate": {type: Date, required:true}
        },
        "departure": {
            "monthDay": {type: String, required:true},
            "fullDate": {type: Date, required:true}
        },
        "description": {
        	"text": String,
        	"language": String
        },
        "numberOfGuests": {type: Number, required:true},
        "nights": {type: Number, required:true},
    }
});

Traveler = mongoose.model('Traveler', TravelerSchema);


exports.update = users => {

    return new Promise((resolve, reject) => { 	

    	try {

			var newUsers = [];

			var sequence = Promise.resolve();

			users.forEach(user => {

				sequence = sequence
					.then(() => { 
						return new Promise((resolve, reject) => {

							Traveler.findOne({"id": user.id}).lean().exec()
								.then(traveler => {
									if (!traveler) {
										user.creationDate = new Date();
										user.ignored = false;
										traveler = new Traveler(user);
										return traveler.save();										
									}
								})
								.then(newUser => {
									if (newUser) {
										newUsers.push(newUser);
									}
									resolve();

								})
								.catch(e => {
									console.log("mongodb error");
									reject(e);
								});
						});			
					})
					.catch(e => {
						console.log(e);

					});
				;
			});
			sequence = sequence.then(() => {
				if (newUsers.length) {
					console.log((newUsers.length + " new user(s)! ").bold.yellow);
				}
				resolve(newUsers);
			})
/*			Promise.all(promises)
				.then(() => {
					console.log(newUsersCount + " new users have been found");
					resolve(newUsersCount);
				})
				.catch(error => {
					console.log("Promise.all error");

				});*/

    	} catch(e) {
//    		console.log(e);
    		reject(e);
    	}


	});
}
