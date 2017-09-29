db.travelers.drop();
db.travelers.createIndex({"id":1}, {unique:true});

db.users.drop();
db.users.createIndex({"name":1}, {unique:true});

db.users.insert({

        name: "Fabrice",

        filterParams: {
            spokenLanguageBlacklist: ['Arabic', 'Maroccan arabic', 'Turkish', 'Indonesian', 'Kazakh', 'Kirghiz', 'Malay', 'Sinhala', 'Yue chinese', 'Chinese', 'Min nan chinese', 'Mandarin chinese', 'Hindi'],
            regexBlacklist: ["boy[\\s]*friend", '[\\s]+bf[\\s]+', 'husband', 'brother', 'compagnon', 'mon copain', 'my parents', 'my partner', 'my m[o|u].m', 'couple(?!\s+of)', 'cheap', 'save money', 'budget', 'I need a place', 'économise', 'pas cher', 'we need a place', 'rent a', 
        'sleep on the floor'],
            countryAlpha2Blacklist: ['DZ', 'BD', 'BA', 'HR', 'MO', 'RS', 'TN', 'TR', 'ID', 'KZ', 'CN', 'IR', 'MX',
        'EG', 'MY', 'QA', 'AE', 'PK', 'PH', 'KH', 'NI', 'PA', 'GT'],
            maxNights: 8,
            descriptionLanguageBlacklist: ['spanish', 'russian', 'ukrainian', 'portuguese', 'bulgarian']
        },

        searchParams: {
            location: "Paris%2C+France",
            days: 30,
            minAge: 21,
            maxAge: 32,
            numGuests: 4,
            gender: "Female"
        },

        slackParams: {
            webhookUrl: "https://hooks.slack.com/services/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"
        }

});

db.users.insert({

        name: "Katya",
        filterParams: {
            spokenLanguageBlacklist: ['Arabic', 'Maroccan arabic', 'Turkish', 'Indonesian', 'Kazakh', 'Kirghiz', 'Sinhala', 'Yue chinese', 'Chinese', 'Min nan chinese', 'Mandarin chinese'],
            regexBlacklist: ['sleep on the floor', 'place to stay', 'stay for free', 'cheap', 'save money', 'budget', 'I need a place', 'rent a'],
            countryAlpha2Blacklist: ['DZ', 'BD', 'RS', 'TN', 'TR', 'ID', 'IR', 'MX',
        'EG', 'MY', 'QA', 'AE', 'PK', 'CO'],
            maxNights: 4,
            descriptionLanguageBlacklist: ['spanish', 'ukrainian', 'portuguese', 'bulgarian']
        },

        searchParams: {
            location: "Kiev%2C+Ukrain",
            days: 30,
            minAge: 25,
            maxAge: 45,
            numGuests: 1,
            gender: "Male"
        },

        slackParams: {
            webhookUrl: "https://hooks.slack.com/services/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"
        }

});

