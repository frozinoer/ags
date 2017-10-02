"use strict";

const util = require('util');
const fs = require('fs');
const _ = require('lodash');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const moment = require('moment');
moment.locale('fr-FR');

var express = require('express');

var app = express();

const colors = require('colors');

const TravelerApi = require("./modules/traveler/api");
const TravelerTransformer = require("./modules/traveler/transformer");
const TravelerData = require("./modules/traveler/data");
const TravelerFilter = require("./modules/traveler/filter");
const TravelerScraper = require("./modules/traveler/scraper");

const UserData = require("./modules/user/data");
User = UserData.User;


const SlackApi = require("./modules/slackApi");
const Ping = require("./modules/ping");

const dotenvResult = require('dotenv').config();
/*if (dotenvResult.error) {
  throw dotenvResult.error
}*/


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
    console.log((`\nExecuted in ${elapsedSeconds} seconds.`).bold);
//    process.exit(0);
};


const getUsers = () => {

    return new Promise((resolve, reject) => {

        User.find().exec()
            .then(resolve)
            .catch(e => {
                console.error("Request error");
                console.log(e);
                reject(e);
            })
    });
};

const getNewTravelers = (users) => {

    var sequence = Promise.resolve();
    sequence = sequence.then(start);

    users.forEach(user => {

        let m = moment();
        let arrivalText = m.format("YYYY-MM-DD");        

        m.add(user.searchParams.days, 'days');
        let departureText = m.format("YYYY-MM-DD");

        user.searchParams.arrivalDate = arrivalText;
        user.searchParams.departureDate = departureText;


        sequence = sequence
            .then(() => {
                console.log(("\n" + user.name).yellow.bold);
            })
            .then(() => TravelerApi.getTravelers(user))
            .catch(e => {
                console.log("Error in getTravelers");
                console.log(e);
            })
            .then(travelers => TravelerTransformer.process(user, travelers))
            .then(transformedTravelers => TravelerFilter.process(user, transformedTravelers))
            .then(filteredTravelers => TravelerData.update(user, filteredTravelers))
            .then(newTravelers => {
                if (user.lastRequestIsNew) {
                    UserData.update(user);
                } else {
                    SlackApi.post(user, newTravelers);                    
                }

            })
            .catch(error => console.log(error.red));    
    });
    sequence = sequence.then(end);
}

/*router.get('/', function (req, res, next) {
    res.render('someView', {msg: 'Express'});
});*/

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index');
});

let appUsers;

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
    initDatabase()
        .then(() => {
            if (!process.env.DEV_MODE) {
                let selfTestDelay = 10 * 60000;
                if (process.env.SELF_TEST_DELAY) {
                    selfTestDelay = process.env.SELF_TEST_DELAY;
                }                
                setInterval(() => {

                    let hour = moment().hour();
                    if (hour < 1 && hour >= 8) {
                        Ping.send();
                    }
                }, selfTestDelay);
            }
        })
        .then(getUsers)
        .then(users => {appUsers = users; return users})
        .then(getNewTravelers);


    setInterval(
        () => {
            Promise
                .resolve(appUsers)
                .then(getNewTravelers)
        }, travelerBatchInterval
    );
});