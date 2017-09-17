const fs = require('fs');
const rp = require('request-promise');
const _ = require('lodash');

const Nightmare = require('nightmare');
require('nightmare-load-filter')(Nightmare);

const dotenvResult = require('dotenv').config();
/*if (dotenvResult.error) {
  throw dotenvResult.error
}*/

let common = require("./common");

getWebUrl = options => {
	let url = process.env.API_BASE_URL
			+ "/members/travelers?" 
			+ common.getUrlParameters(options);
	return url;
}

exports.getPageContent = options => {

    return new Promise((resolve, reject) => { 

		let url = getWebUrl(options);
		console.log("url: " + url);

		var nightmare = Nightmare({ 'show': true, 'web-preferences': {'web-security': false} }, {typeInterval: 1}, { waitTimeout:3000});

	    nightmare
	    .goto(url)
	    .wait("img.mod-round,a.mod-forgot-password")
//	    .then(() => console.log("fin premier wait"))
	/*    .filter({}, (details, cb) => {
	        return cb({cancel: (/(js)|(woff)|(png)|(svg)|(css)|(jpg)|(gif)/ig.test(details.url))});
	    })*/
		.then(() => login(nightmare))
		.then(() => expandPage(nightmare))
		.then(() => parsePage(nightmare))
		.then(resolve)
//		.end()
	    .catch(e => reject(e))
	});
}

const getTravelers = html => {
	console.log(html);	
	return [html.length];
};

const parsePage = nightmare => {
    return new Promise((resolve, reject) => {    
		nightmare
			.evaluate(() => {
				return new Promise((resolve, reject) => {
						resolve(document.documentElement.innerHTML);
				});
			})
			.then(html => {
				resolve(getTravelers(html));
			})
			.catch(e => reject(e));    	
    });
};

const expandPage = nightmare => {

    return new Promise((resolve, reject) => {    

		nightmare
			.evaluate(() => {
				return new Promise((resolve, reject) => {
						resolve(document.querySelector("div.pagination a") != null);
				});
			})
			.then(toPage => {
				if (toPage) {
					console.log("to page...");
					nightmare
						.click("div.pagination a")
						.wait(2000)
						.then(() => expandPage(nightmare))
						.then(resolve);
				} else {
					console.log("No more paging :)");
					resolve();
				}
			})
			.catch(e => reject(e));
	});
}

const login = nightmare => {

    return new Promise((resolve, reject) => {    
    	nightmare
//    		.wait('img.mod-round a.mod-facebook')
    		.evaluate(() => {
    			if (document.querySelector('img.mod-round')) {
    				return "logged";
    			}
    			if (document.querySelector('a.mod-facebook')) {
    				return "facebookAvailable";
    			}
    			return {type:null};
    		}).then(type => {
    			if (type === "logged") {
    				resolve();
    			} else if (type === "facebookAvailable") {
    				nightmare
    					.click("a.mod-facebook")
    					.evaluate(() => {
					     	document.getElementById("email").value=process.env.FB_EMAIL;
					      	document.getElementById("pass").value=process.env.FB_PASSWORD;
					      	document.getElementById("loginbutton").click();    						
    					})
    					.wait("img.mod-round")
    					.wait(2000)
//						.wait("#search-results-count span[data-reactroot]")
						.then(resolve);    						
    			} else {
    				console.log("Pas de connexion a facebook");
    				reject();
    			}

    		});

    });

};


/*exports.run = (fn, options) => {
    return new Promise((resolve, reject) => {    

			fn(options)
				.then(travelers => {
					nightmare.end();
					console.log(travelers);					
					resolve(travelers);
				})
				.catch(e => reject(e));			

    });
};*/
