const _ = require('lodash');

let spokenLanguageBlacklist = ['Arabic', 'Maroccan arabic', 'Turkish', 'Indonesian', 'Kazakh', 'Kirghiz', 'Malay', 
		'Sinhala', 'Yue chinese', 'Chinese', 'Min nan chinese', 'Mandarin chinese', 'Hindi'];

let regexBlacklist = ["boy[\\s]*friend", '[\\s]+bf[\\s]+', 'husband', 'brother', 'compagnon', 'my mum', 'my mom', 'young couple', 'cheap', 'save money', 'budget', 'I need a place', 'économise', 'pas cher', 'we need a place', 'rent a', 'Я', 
	'sleep on the floor'];

let countryAlpha2Blacklist = ['DZ', 'BD', 'BA', 'HR', 'MO', 'RS', 'TN', 'TR', 'ID', 'KZ', 'CN', 'IR', 'MX',
	'EG', 'MY', 'QA', 'AE', 'PK', 'PH', 'KH', 'NI', 'PA', 'GT'];

let maxNights = 7;

let keywordRegex = new RegExp(regexBlacklist.join("|"), "i");



const descriptionLanguageFilter = user => {

	let language = user.trip.description.language;

	if (!language || language === "pidgin" || language === "english" || language === "french" ) {
		return true;
	/*					if (guessedLanguage === "pidgin") {
				console.log(user.publicName + ": " + guessedLanguage + " - " + user.trip.description);
			}*/
	}

	return false;
};

const spokenLanguageFilter = user => {

	let pass = true;

	if (user.languages && user.languages.fluent) {

		user.languages.fluent.forEach(function(fluent) {
			if (_.find(spokenLanguageBlacklist, language => language === fluent.name)) {
				pass = false;
			}
		})
	}
	return pass;	
};

const descriptionRegexFilter = user => {
	return (user.trip.description.text.match(keywordRegex) == null);	
};

const countryFilter = user => {

	let country = user.country;
	return (!country || !country.alpha2 || _.indexOf(countryAlpha2Blacklist, country.alpha2) < 0);	

};

nicknameFilter = user => {
	return (user.publicName.indexOf(" ") > 0);
}

maxNightsFilter = user => {
	return (user.trip.nights <= maxNights);
}


exports.process = users => {
    return new Promise((resolve, reject) => {
    	try {

//    		console.log(users[0]);

//			console.log("Before filtering 'users' length is: " + users.length);

			let descriptionLanguageFiltered = _.filter(users, descriptionLanguageFilter);

//			console.log("After description language filter 'users' length is: " + descriptionLanguageFiltered.length);

			let spokenLanguageFiltered = _.filter(descriptionLanguageFiltered, spokenLanguageFilter);

//			console.log("After spoken language filter 'users' length is: " + spokenLanguageFiltered.length);

			let descriptionRegexFiltered = _.filter(spokenLanguageFiltered, descriptionRegexFilter);

//			console.log("After description regex filter 'users' length is: " + descriptionRegexFiltered.length);

			let countryFiltered = _.filter(descriptionRegexFiltered, countryFilter);

//			console.log("After country filter 'users' length is: " + countryFiltered.length);

			let nicknameFiltered = _.filter(countryFiltered, nicknameFilter);

//			console.log("After nickname filter 'users' length is: " + nicknameFiltered.length);

			let maxNightsFiltered = _.filter(nicknameFiltered, maxNightsFilter);

//			console.log("After max nights filter 'users' length is: " + maxNightsFiltered.length);

			let filteredUsers = maxNightsFiltered;		

			console.log("After filtering " + filteredUsers.length + " users");
			
			resolve(filteredUsers);
    	} catch(e) {
    		console.log(e);
    		reject(e);
    	}
    });
}