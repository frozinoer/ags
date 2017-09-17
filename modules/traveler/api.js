const fs = require('fs');
const rp = require('request-promise');
const _ = require('lodash');

const dotenvResult = require('dotenv').config();
if (dotenvResult.error) {
  throw dotenvResult.error
}

let common = require("./common");

let perPage = 100;

let lastWorkingTotalCount = 0;

getApiUrl = (options, page, perPage) => {

	let url = process.env.API_BASE_URL
			+ `/api/web/visits/search?`
			+ common.getUrlParameters(options, perPage)
		    + `&controller=user_profiles&action=travelers`
		    + `&page=${page}`
		    + `&city=Paris&latLng=48.856614%2C2.3522219&location_text=Paris%2C%20France&search=paris--france`
    return url;
}

const getApiPage = (options, page, perPage, expectedPageSize) => {

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
						if (!lastWorkingTotalCount) {
							lastWorkingTotalCount = o.totalCount;
							resolve(response.body);
						} else {
							if (Math.abs(o.totalCount - lastWorkingTotalCount) > 30) {
								throw "Incomplete first page";
							}
							lastWorkingTotalCount = o.totalCount;
							resolve(response.body);
						}
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

exports.getUsers = options => {
    return new Promise((resolve, reject) => { 

    	let users;

		let sequence = Promise.resolve();

		getApiPage(options, 1, perPage)
			.then(o => {
    			return new Promise((resolve, reject) => {    		
	    			users = o.users;
//	    			console.log("total pages: " + o.totalPages);
	    			console.log("Search returned " + o.totalCount + " users");
					
					for (let i = 2; i < o.totalPages + 1; ++i) {

				    	let expectedPageSize = perPage;
				    	if (i == o.totalPages) {
				    		expectedPageSize = o.totalCount % perPage
				    	}

						sequence = sequence
							.then(() => getApiPage(options, i, perPage, expectedPageSize))
				    		.then(o => {
				    			users = _.concat(users, o.users);
				    		}).catch(error => {
				    			console.log("Page " + i + " error");
				    		});
					}
					sequence.then(resolve);
				});

    		})
    		.then(() => {
				users = _.uniq(users);
//				console.log("Found: " + users.length + " users");
				resolve(users);				    
			})
			.catch(error => {
				console.log("request error");
				reject(error);
			})


	});	
}
