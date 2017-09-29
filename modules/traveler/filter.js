const _ = require('lodash');
const countryList = require("iso-3166-country-list");


let filteringHits = {};


const addFilteringHit = (key, foundItem) => {
	if (!filteringHits[key]) {
		filteringHits[key] = {};
		filteringHits[key].hits = 1;
		filteringHits[key].foundItems = {};
	} else {
		filteringHits[key].hits++;
	}
	if (foundItem) {
		if (!filteringHits[key].foundItems[foundItem]) {
			filteringHits[key].foundItems[foundItem] = 1;
		} else {
			filteringHits[key].foundItems[foundItem]++;			
		}
	}
}

const addException = (o, key, foundItem) => {
	if (!o.exceptions) {
		o.exceptions = {};
	}
	o.exceptions[key] = foundItem;
	addFilteringHit(key, foundItem);
};


const filterByDescriptionLanguage = o => {


	let traveler = o.traveler;

//		console.log("filterByDescriptionLanguage");		

	let language = traveler.trip.description.language;
	let descriptionLanguageBlacklist = o.params.descriptionLanguageBlacklist;

	if (language && _.find(descriptionLanguageBlacklist, blackListLanguage => blackListLanguage === language)) {
		addException(o, "descriptionLanguage", language);
	}

	return o;
};

const filterBySpokenLanguage = o => {


	let traveler = o.traveler;

//		console.log("filterBySpokenLanguage");

	let foundLanguage = false;
	let foundLanguageName;

	let spokenLanguageBlacklist = o.params.spokenLanguageBlacklist;	

	if (traveler.languages && traveler.languages.fluent) {

		traveler.languages.fluent.forEach(function(fluent) {
			if (!foundLanguage && _.find(spokenLanguageBlacklist, language => language === fluent.name)) {
				foundLanguageName = fluent.name;
				foundLanguage = true;
			}
		});
		if (foundLanguage) {
			addException(o, "spokenLanguage", foundLanguageName);				
		}
	}
	return o;

};

const filterByDescriptionRegex = o => {


	let traveler = o.traveler;


//		console.log("filterByDescriptionRegex");

	let regexBlacklist = o.params.regexBlacklist;

	let matchedRegex = false;
	let matchedRegexText;

	regexBlacklist.forEach(regexText => {

		if (!matchedRegex) {
			let regex = new RegExp(regexText, "i");

			if (traveler.trip.description.text.match(regex) != null) {
				matchedRegex = true;
				matchedRegexText = regexText;				
			}				
		}

	});

	if (matchedRegex) {
		addException(o, "descriptionRegex", matchedRegexText);
	}

	return o;
	

};

const filterByCountry = o => {


	let traveler = o.traveler;


//		console.log("filterByCountry");

	let countryAlpha2Blacklist = o.params.countryAlpha2Blacklist;

	let country = traveler.country;
	if (country && country.alpha2) {
		let foundAlpha2 = countryAlpha2Blacklist.find(e => country.alpha2 === e);
		if (foundAlpha2) {
			addException(o, "country", countryList.name(foundAlpha2));
		}
	}
	return o;
};

const filterByNickname = o => {

	let traveler = o.traveler;


//		console.log("filterByNickname");		

	if (traveler.publicName.indexOf(" ") < 0) {
		addException(o, "nickname", traveler.publicName);
	}
	return o;
}

const filterByMaxNights = o => {

	let traveler = o.traveler;


//		console.log("filterByMaxNights");

	let maxNights = o.params.maxNights;

	if (traveler.trip.nights > maxNights) {
		addException(o, "maxNights", traveler.trip.nights);
	}
	return o;
}


exports.process = (user, travelers) => {

    return new Promise((resolve, reject) => {

/*		user.filterParams.countryAlpha2Blacklist.forEach(alpha2 => {
			console.log("alpha2: " + alpha2 + " country: " + countryList.name(alpha2));
		});*/


    	let params = user.filterParams;

		filteringHits = {};

		let filteredTravelers = [];

		var sequence = Promise.resolve();

		travelers.forEach(traveler => {

			let o = {traveler: traveler, params: params};
			sequence = sequence
//				.then(() => {console.log("Checking " + traveler.publicName)})
				.then(() => Promise.resolve(o))
				.then(filterByDescriptionLanguage)
				.then(filterBySpokenLanguage)
				.then(filterByDescriptionRegex)
				.then(filterByCountry)
//				.then(filterByNickname)
				.then(filterByMaxNights)
				.then(o => {
					if (!o.exceptions) {
						filteredTravelers.push(o.traveler);
					}
				}).catch(e => {
					console.log("Error for traveler: " + traveler.publicName);
					console.log(e);
				});
		});
		sequence = sequence.then(() => {

			let stats = "";

			_.forEach(filteringHits, (value, key) => {				
				stats += "Filter by " + key + " -> " + value.hits + "\n";
				if (value.foundItems) {

//					let sortedItems = _.reverse(_.sortBy(_.keys(value.foundItems), ))
					_.forEach(value.foundItems, (value, key) => {
						stats += "	Found item: " + key + " -> " + value + "\n";
					});

				}
			});
//			console.log("Statistics for " + user.name);
//			console.log(stats);
	    	console.log("Search returned: " + travelers.length + " - after filtering: " + filteredTravelers.length);
			resolve(filteredTravelers);
		})
	});
}
