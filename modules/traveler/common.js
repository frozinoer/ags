const _ = require('lodash');


exports.getUrlParameters = (options, perPage) => {
	let params 
		= `utf8=%E2%9C%93&keyword=&button=&search_query=Paris%2C+France&latitude=48.856614&longitude=2.3522219&country=&region=`
		+ `&arrival_date=${options.arrivalDate}&departure_date=${options.departureDate}`
		+ `&num_guests=${options.numGuests}`
		+ `&country_of_residence=`
		+ `&gender=Female`
		+ `&perPage=${perPage}`
		+ `&min_age=${options.minAge}&max_age=${options.maxAge}`
		+ `&languages_spoken=`
		+ `&radius=25`;

	return params;
}
