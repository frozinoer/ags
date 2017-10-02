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
    "lastSeenDate": {type: Date, required:true},    
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


const updateTraveler = (t, d) => {

    return new Promise((resolve, reject) => { 	

		Traveler.findOne({"id": t.id}).exec()
			.then(traveler => {
				if (!traveler) {
					traveler = new Traveler(t);
					traveler.creationDate = d;
					traveler.lastSeenDate = d;
					traveler.ignored = false;					
					traveler
						.save()
						.then(() => {
							resolve(traveler)
						})
						.catch(e => {
							console.log(e);					
							reject(e);
						});
				} else {
					traveler.lastSeenDate = d;
					traveler
						.save()
						.then(() => {
							resolve()
						})
						.catch(e => {
							console.log(e);					
							reject(e);
						});
				}

			})
			.catch(e => {
				console.log(e);
				reject(e);
			})
	});

};

exports.update = (user, travelers) => {

    return new Promise((resolve, reject) => { 

    	try {

			let newTravelers = [];

			let sequence = Promise.resolve();

			let newDate = new Date();

			travelers.forEach(traveler => {

				sequence = sequence
					.then(() => updateTraveler(traveler, newDate))
					.then(newTraveler => {
						if (newTraveler) {
							newTravelers.push(newTraveler);
						}
					})
			});
			sequence = sequence.then(() => {
				if (newTravelers.length) {
					console.log((newTravelers.length + " new travelers(s)! ").bold.yellow);
				}
				resolve(newTravelers);
			})
    	} catch(e) {
//    		console.log(e);
    		reject(e);
    	}


	});
}
