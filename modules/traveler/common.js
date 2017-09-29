const _ = require('lodash');


exports.getUrlParameters = (options) => {
	let params = `utf8=%E2%9C%93`

		params += `&search_query=${options.location}`

//		params += `&latitude=48.856614&longitude=2.3522219`

//		params += &country=&region=`;

		if (options.arrivalDate) {
			params += `&arrival_date=${options.arrivalDate}`;
		}

		if (options.departureDate) {
			params += `&departure_date=${options.departureDate}`;
		}

		if (options.minAge) {
			params += `&min_age=${options.minAge}`;
		}

		if (options.maxAge) {
			params += `&max_age=${options.maxAge}`;
		}

		if (options.numGuests) {
			params += `&num_guests=${options.numGuests}`;
		}

		if (options.gender === "Female" || options.gender === "Male") {
			params += `&gender=${options.gender}`;
		}

		params += `&country_of_residence=`
				+ `&languages_spoken=`
				+ `&radius=25`;

	return params;
}
