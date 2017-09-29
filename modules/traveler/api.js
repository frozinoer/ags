const fs = require('fs');
const rp = require('request-promise');
const _ = require('lodash');

const dotenvResult = require('dotenv').config();
/*if (dotenvResult.error) {
  throw dotenvResult.error
}*/

let common = require("./common");

let perPage = 100;

getApiUrl = (options, page, perPage) => {

	let url = process.env.API_BASE_URL
			+ `/api/web/visits/search?`
			+ common.getUrlParameters(options, perPage)
		    //+ `&controller=user_profiles&action=travelers`
		    + `&page=${page}`;
//		    + `&city=Paris&latLng=48.856614%2C2.3522219&location_text=Paris%2C%20France&search=paris--france`
    return url;
}

const getApiPage = (user, options, page, perPage, expectedPageSize) => {

    return new Promise((resolve, reject) => {

    	let headers = {};
    	headers[process.env.ACCESS_TOKEN_PARAM] = process.env.ACCESS_TOKEN_VALUE;

//    	console.log("getApiPage[page:" + page + "]");

		let reqOpts = {
		    uri: getApiUrl(options, page, perPage),
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
						user.lastTotalCount = o.totalCount;
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
				console.log("	Warning : " + error);
				resolve()
			})
/*			.then(() => {
				console.log("Place for replay");
//				getApiPage(options, page, perPage, expectedPageSize)

			})*/;
	})
	.then(result => {
		if (result) {
			return result;
		} else {
			return getApiPage(options, page, perPage, expectedPageSize);
		}
	});	
}

exports.getTravelers = user => {
    return new Promise((resolve, reject) => { 

    	let searchParams = user.searchParams;

    	let travelers;

		let sequence = Promise.resolve();

		getApiPage(user, searchParams, 1, perPage)
			.then(o => {
    			return new Promise((resolve, reject) => {    		
	    			travelers = o.users;
//	    			console.log("total pages: " + o.totalPages);

					if (!user.lastTotalCount) {

						user.lastTotalCount = o.totalCount;
						console.log("set initial de user.lastTotalCount a " + user.lastTotalCount);


						for (let i = 2; i < 15; ++i) {
							sequence = sequence
								.then(() => getApiPage(user, searchParams, 1, perPage))
								.then(newO => {
									if (newO.totalCount > o.totalCount) {
										o = newO;
										user.lastTotalCount = o.totalCount;
										travelers = o.users;
										console.log("augmentation de user.lastTotalCount a " + user.lastTotalCount);
									}
								})
						}
					}
					
					for (let i = 2; i < o.totalPages + 1; ++i) {

				    	let expectedPageSize = perPage;
				    	if (i == o.totalPages) {
				    		expectedPageSize = o.totalCount % perPage
				    	}

						sequence = sequence
							.then(() => getApiPage(user, searchParams, i, perPage, expectedPageSize))
				    		.then(o => {
				    			travelers = _.concat(travelers, o.users);
				    		}).catch(error => {
				    			console.log("Page " + i + " error");
				    		});
					}
	    			sequence
						.then(resolve);
				});

    		})
    		.then(() => {
//				travelers = _.uniq(travelers);
				resolve(travelers);				    
			})
			.catch(error => {
				console.log("request error");
				reject(error);
			})


	});	
}
