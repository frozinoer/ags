const fs = require('fs');
const rp = require('request-promise');
const _ = require('lodash');
const Promise = require("bluebird");

const dotenvResult = require('dotenv').config();
/*if (dotenvResult.error) {
  throw dotenvResult.error
}*/

let common = require("./common");

let perPage = 100;
let initFirstPageAttempts = 5;
let initFirstPageDelayInMs = 100;

getApiUrl = (urlParameters, page, perPage) => {

	let url = process.env.API_BASE_URL
			+ `/api/web/visits/search?`
			+ urlParameters
			+ `&perPage=${perPage}`
		    + `&page=${page}`
//			+ `&controller=user_profiles&action=travelers`		    
//		    + `&city=Paris&latLng=48.856614%2C2.3522219&location_text=Paris%2C%20France&search=paris--france`
			;
    return url;
}

const getApiPage = (user, urlParameters, page, perPage, expectedPageSize) => {

    return new Promise((resolve, reject) => {

//    	console.log("getApiPage: " + user.name + ", page: " + page);

    	let headers = {};
    	headers[process.env.ACCESS_TOKEN_PARAM] = process.env.ACCESS_TOKEN_VALUE;

//    	console.log("getApiPage[page:" + page + "]");

		let reqOpts = {
		    uri: getApiUrl(urlParameters, page, perPage),
		    headers: headers, 
		    json: true,
		    resolveWithFullResponse: true,
		    timeout: 3000
		};

//		let sequence = Promise.resolve();

		rp(reqOpts)
			.then(response => {

				let success = true;

//				console.log("status code: " + response.statusCode);
				if (response.statusCode == 200) {
					var o = response.body;

					let foundUsers = o.users.length;

					if (page == 1) {
						if (user.lastTotalCount && Math.abs(o.totalCount - user.lastTotalCount) > 30) {
							throw "Incomplete first page";
						}
//						user.lastTotalCount = o.totalCount;
						resolve(response.body);

					} else {
						if (expectedPageSize && expectedPageSize > foundUsers) {
					    	throw `${foundUsers} results found on page ${page} (was supposed to be ${expectedPageSize})`;
						} else {
							resolve(response.body);						
						}						
					}

				} else {
					throw response.statusCode;
				}

			})
			.catch(error => {
//				console.log("	Warning : " + error);
				resolve()
			})
	})
	.then(result => {
		if (result) {
			return result;
		} else {
			return getApiPage(user, urlParameters, page, perPage, expectedPageSize);
		}
	});	
}

exports.getTravelers = user => {
    return new Promise((resolve, reject) => { 

    	let travelers;

		

		let urlParameters = common.getUrlParameters(user.searchParams);

		if (urlParameters !== user.lastUrlParameters) {
			console.log(("Request is new: " + urlParameters).green);
			user.lastRequestIsNew = true;
			user.lastUrlParameters = urlParameters;
		} else {
			user.lastRequestIsNew = false;
		}

		getApiPage(user, urlParameters, 1, perPage)
			.then(o => {
    			return new Promise((resolve, reject) => {    		

					if (!user.lastTotalCount) {

//						console.log("Attempt 1/" + initFirstPageAttempts + " returned " + o.totalCount);

						let sequence = Promise.resolve();

						for (let i = 0; i < initFirstPageAttempts - 1; ++i) {
							sequence = sequence
								.then(() => getApiPage(user, urlParameters, 1, perPage))
								.then(newO => {
//									console.log("Attempt " + (i+2) + "/" + initFirstPageAttempts + " returned " + o.totalCount);
									if (newO.totalCount > o.totalCount) {
										o = newO;
										console.log("Attempt " + (i+2) + "/" + initFirstPageAttempts + " changed total to " + o.totalCount);										
									}
								})
								.delay(initFirstPageDelayInMs)
						}
						sequence.then(() => {
							resolve(o)
						})
					} else {
						resolve(o);
					}
				})
    		})
			.then(o => {
				user.lastTotalCount = o.totalCount;
				travelers = o.users;
				return o;
			})
			.then(o => {

    			return new Promise((resolve, reject) => {    		


				    let sequence = Promise.resolve();

					for (let i = 2; i < o.totalPages + 1; ++i) {

				    	let expectedPageSize = perPage;
				    	if (i == o.totalPages) {
				    		expectedPageSize = o.totalCount % perPage
				    	}

						sequence = sequence
							.then(() => getApiPage(user, urlParameters, i, perPage, expectedPageSize))
				    		.then(o => {
				    			travelers = _.concat(travelers, o.users);
				    		}).catch(error => {
				    			console.log("Page " + i + " error");
				    		});
					}
					sequence = sequence.then(resolve);
    			})
    		})
    		.then(() => {
				travelers = _.uniqBy(travelers, 'id');
				resolve(travelers);				    
			})
			.catch(error => {
				console.log("request error");
				reject(error);
			})
	});	
}
