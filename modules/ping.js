const fs = require('fs');
const rp = require('request-promise');
const _ = require('lodash');

const dotenvResult = require('dotenv').config();

exports.send = () => {

    return new Promise((resolve, reject) => {

		let reqOpts = {
		    uri: process.env.SELF_TEST_URL,
		    timeout: 3000
		};

//		let sequence = Promise.resolve();

		rp(reqOpts)
			.then(response => {
				resolve();
			})
			.catch(error => {
//				console.log("	Warning : " + error);
				resolve()
			})
	});

}
