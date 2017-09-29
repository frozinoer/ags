const _ = require('lodash');
const moment = require('moment');
const LanguageDetect = require('languagedetect');
const countryList = require("iso-3166-country-list");
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
let ld = new LanguageDetect();

const transformLanguage = traveler => {

	let description = traveler.trip.description;
	let detectedLanguages = ld.detect(description);


	let guessedLanguage = null;
	if (detectedLanguages && detectedLanguages[0]) {
		guessedLanguage = detectedLanguages[0][0];
	}

	traveler.trip.description = {
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

const transformCountry = traveler => {

	let countryName = traveler.country;

	if (countryName) {
		countryName = replaceInvalidISOCountry(countryName);
		let countryAlpha2 = countryList.code(countryName);
	//	member.fromAlpha2 = countryAlpha2;
/*	    if (!countryAlpha2) {
	    	console.log(("No alpha-2 for " + countryName).yellow);
			console.log(user);	    	
	    }*/
	    traveler.country = {
	    	alpha2: countryAlpha2,
	    	name: countryName
	    }
	}

}

const transformTrip = traveler => {
	let trip = traveler.trip;

	let arrival = trip.arrival.fullDate;
	let departure = trip.departure.fullDate;


	var d = moment.duration(moment(departure, "YYYY-MM-DD").diff(moment(arrival, "YYYY-MM-DD")));
	trip.nights = Math.round(d.asDays());

}


const transformDescription = traveler => {
	let description = traveler.trip.description;
	traveler.trip.description = entities.decode(description);
}

exports.process = (user, travelers) => {

	travelers.forEach(traveler => {
//    			transformUserId(user);
		transformDescription(traveler);
		transformLanguage(traveler);
		transformCountry(traveler);
		transformTrip(traveler);
	});		
	return travelers;
}
