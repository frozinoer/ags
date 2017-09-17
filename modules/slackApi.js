const IncomingWebhook = require('@slack/client').IncomingWebhook;
const moment = require('moment');

//var url = process.env.SLACK_WEBHOOK_URL || '';
const url = "https://hooks.slack.com/services/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";

var webhook = new IncomingWebhook(url);


const userToMessage = user => {
/*	let text = `${user.avatarUrl}\n` 
			 + `*${user.publicName}* - ${user.country.name} - ${user.trip.numberOfGuests} guest(s)\n\n`
			 + `${user.trip.description.text}\n\n`
			 + `https://www.couchsurfing.com${user.profileLink}`;

	return text;

			 */

	var arrival = user.trip.arrival.fullDate;
	var departure = user.trip.departure.fullDate;

	let title = moment(arrival, "YYYY-MM-DD").format("ddd DD/MM") + " - " + moment(departure, "YYYY-MM-DD").format("ddd DD/MM");

	let message = {
	    "text": title,
	    "attachments": [
	        {
	            "title": user.publicName,
	            "title_link": "https://www.couchsurfing.com" + user.profileLink,
	            "fields": [
	                {
	                    "title": "Travelers",
	                    "value": user.trip.numberOfGuests,
	                    "short": true
	                },
	                {
	                    "title": "Nights",
	                    "value": user.trip.nights,
	                    "short": true
	                }
	            ],
	            "author_name": user.country.name,
	            "image_url": user.avatarUrl
	        },
	        {
	            "title": "Message",
	            "text": user.trip.description.text
	        }
	    ]
	}
	return message;

};


exports.post = newUsers => {

	if (newUsers.length) {
		console.log(`Posting ${newUsers.length} messages on Slack...`);
		newUsers.forEach(user => {

			let message = userToMessage(user);

			webhook.send(message, function(err, header, statusCode, body) {
			  if (err) {
			    console.log('Error posting on Slack:', err);
			  } else {
			    console.log('Received', statusCode, 'from Slack');
			  }
			});
		});
	}
};
