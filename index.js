"use strict";

const util = require('util');
const fs = require('fs');
const _ = require('lodash');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const moment = require('moment');
var express = require('express');
var app = express();


const colors = require('colors');

const TravelerApi = require("./modules/traveler/api");
const TravelerTransformer = require("./modules/traveler/transformer");
const TravelerStorage = require("./modules/traveler/storage");
const TravelerFilter = require("./modules/traveler/filter");
const TravelerScraper = require("./modules/traveler/scraper");

const SlackApi = require("./modules/slackApi");

const dotenvResult = require('dotenv').config();
if (dotenvResult.error) {
  throw dotenvResult.error
}


let travelerBatchInterval = process.env.TRAVELER_BATCH_INTERVAL_IN_MS;


const initDatabase = () => {

    return new Promise((resolve, reject) => {

        mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
        let db = mongoose.connection;
        db.on('error', function(err) {
            reject(err);
        });
        db.once('open', function() {
            console.log(("\nConnected to database").bold.green);            
            resolve();
        });
    });
};


let batchStartTime;

const start = () => {
    let time = moment().format("HH:mm:ss");
    console.log((`\n${time} Traveler search`).bold);
    batchStartTime = new Date().getTime();        
};

const end = () => {
    let batchEndTime = new Date().getTime();   
    let elapsedSeconds = (batchEndTime - batchStartTime) / 1000;     
    console.log((`Executed in ${elapsedSeconds} seconds.`));
//    process.exit(0);
};


const getTravelerListOptions = () => {

    let minAge = 21;
    let maxAge = 32;
    let numGuests = 4;
//    let travelerSearchDurationInDays = 32;

    let m = moment();
    let arrivalText = m.format("YYYY-MM-DD");

//    m.add(travelerSearchDurationInDays, 'days');
//    let departureText = m.format("YYYY-MM-DD");
    let departureText = process.env.SEARCH_PARAM_DEPARTURE_DATE;

    return {
        arrivalDate: arrivalText,
        departureDate: departureText,
        minAge: minAge,
        maxAge: maxAge,
        numGuests: numGuests
    };
};


const checkTravelerApi = (options) => {
    Promise.resolve()
    .then(start)
//    .then(initDatabase)
    .then(() => TravelerApi.getUsers(options))
    .catch(e => {
        console.log("Error in getUsers");
        console.log(e);
    })
    .then(TravelerTransformer.process)
    .then(TravelerFilter.process)
    .then(TravelerStorage.update)
    .then(SlackApi.post)
    .then(end)
    .catch(error => console.log(error.red));    
}

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
  initDatabase();
  setInterval(() => checkTravelerApi(getTravelerListOptions()), travelerBatchInterval);

});
