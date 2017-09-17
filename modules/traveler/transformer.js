const _ = require('lodash');
const moment = require('moment');
const LanguageDetect = require('languagedetect');
const countryList = require("iso-3166-country-list");
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
let ld = new LanguageDetect();

const transformLanguage = user => {

	let description = user.trip.description;
	let detectedLanguages = ld.detect(description);


	let guessedLanguage = null;
	if (detectedLanguages && detectedLanguages[0]) {
		guessedLanguage = detectedLanguages[0][0];
	}

	user.trip.description = {
		text: description,
		language: guessedLanguage
	};

};

const replaceInvalidISOCountry = name => {

	name = name.replace("Macedonia-FYROM", "Macedonia, the Former Yugoslav Republic of");
	name = name.replace(/^Iran$/, "Iran, Islamic Republic Of");
	name = name.replace(/^Moldova$/, "Moldova, Republic of");
	name = name.replace("USA", "United States");
	name = name.replace("UAE", "United Arab Emirates");	
	name = name.replace("UK", "United Kingdom");
	name = name.replace("GBR", "United Kingdom");	
	name = name.replace("England", "United Kingdom");		
	name = name.replace("Vietnam", "Viet Nam");
	name = name.replace("Indonesian", "Indonesia");	
	name = name.replace(/^Russia$/, "Russian Federation");
	name = name.replace(/^Bolivia$/, "Bolivia, Plurinational State of");		
	name = name.replace("South Korea", "Korea, Republic of");
	name = name.replace(/^Korea$/, "Korea, Republic of");		
	name = name.replace("Ireland (Republic of)", "Ireland");
	name = name.replace("Taiwan, Republic Of China", "Taiwan, Province of China");
	return name;

}

const transformCountry = user => {

	let countryName = user.country;

	if (countryName) {
		countryName = replaceInvalidISOCountry(countryName);
		let countryAlpha2 = countryList.code(countryName);
	//	member.fromAlpha2 = countryAlpha2;
/*	    if (!countryAlpha2) {
	    	console.log(("No alpha-2 for " + countryName).yellow);
			console.log(user);	    	
	    }*/
	    user.country = {
	    	alpha2: countryAlpha2,
	    	name: countryName
	    }
	}

}

const transformTrip = user => {
	let trip = user.trip;

	let arrival = trip.arrival.fullDate;
	let departure = trip.departure.fullDate;

	var d = moment.duration(moment(departure, "YYYY-MM-DD").diff(moment(arrival, "YYYY-MM-DD")));
//	console.log(d.asDays());
	trip.nights = d.asDays();

}

const transformDescription = user => {
	let description = user.trip.description;
	user.trip.description = entities.decode(description);
}

/*const transformUserId = user => {
	var id = user.id;
	user.userId = "" + id;
	delete user[id];
}*/

exports.process = users => {
    return new Promise((resolve, reject) => {
    	try {

    		users.forEach(user => {
//    			transformUserId(user);
				transformDescription(user);
    			transformLanguage(user);
    			transformCountry(user);
    			transformTrip(user);
    		});
			
			resolve(users);
    	} catch(e) {
    		console.log(e);
    		reject(e);
    	}
    });
}
