const IncomingWebhook = require('@slack/client').IncomingWebhook;
const moment = require('moment');

const dotenvResult = require('dotenv').config();

const travelerToMessage = traveler => {

	try {
			var arrival = traveler.trip.arrival.fullDate;
			var departure = traveler.trip.departure.fullDate;

			let title = traveler.publicName.split(" ")[0];

			if (traveler.trip.numberOfGuests > 1) {
				title += " (" + traveler.trip.numberOfGuests + " guests)";
			}

			title += " " + moment(arrival, "YYYY-MM-DD").format("DD/MM") + "-" + moment(departure, "YYYY-MM-DD").format("DD/MM");

			let message = {
			    "text": title,
			    "attachments": [
			        {
			            "title": traveler.publicName,
			            "title_link": process.env.API_BASE_URL + traveler.profileLink,
			            "fields": [
			                {
			                    "title": "Travelers",
			                    "value": traveler.trip.numberOfGuests,
			                    "short": true
			                },
			                {
			                    "title": "Nights",
			                    "value": traveler.trip.nights,
			                    "short": true
			                }
			            ],
			            "author_name": traveler.country.name,
			            "image_url": traveler.avatarUrl
			        },
			        {
			            "title": "Message",
			            "text": traveler.trip.description.text
			        }
			    ]
			}
			return message;
	} catch(e) {
		console.log(e);
		throw e;
	} 



};


exports.post = (user, newTravelers) => {

	let slackParams = user.slackParams;

	let webhook = new IncomingWebhook(slackParams.webhookUrl);

	if (newTravelers.length) {
		console.log(`Posting ${newTravelers.length} messages on Slack...`);
		newTravelers.forEach(traveler => {

			let message = travelerToMessage(traveler);

			webhook.send(message, function(err, header, statusCode, body) {
			  if (err) {
			    console.log('Error posting on Slack:', err);
			  }/* else {
			    console.log('Received', statusCode, 'from Slack');
			  }*/
			});
		});
	}
};
