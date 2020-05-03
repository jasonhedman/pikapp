const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Chance = require('chance');

exports.createUser = functions.https.onCall(async (req,res) => {
    let sports = {
        basketball: 21,
        spikeball: 21,
        football: 35,
        soccer: 3,
        volleyball: 3
    }
    let chance = new Chance()
    let gender = chance.gender().toLowerCase();
    let first = chance.first({nationality:'en', gender:gender});
    let last = chance.last({nationality:'en'});
    let username;
    switch(chance.integer({min:0, max:6})){
        case 0:
        username = first.toLowerCase() + last.toLowerCase();
        break;
        case 1:
        username = first[0].toLowerCase() + last.toLowerCase();
        break;
        case 2:
        username = first[0].toLowerCase() + last.toLowerCase() + chance.integer({min:1,max:999});
        break;
        case 3:
        username = first[0].toLowerCase() + last[0].toLowerCase() + chance.integer({min:1,max:999});
        break;
        case 4:
        username = first.toLowerCase() + last.toLowerCase() + chance.integer({min:1,max:999});
        break;
        case 5:
        username = first.toLowerCase();
        break;
        case 6:
        username = last.toLowerCase();
    }
    let sportsResults = {
        basketball: {
            gamesPlayed: 0
        },
        football: {
            gamesPlayed: 0
        },
        spikeball: {
            gamesPlayed: 0
        },
        volleyball: {
            gamesPlayed: 0
        },
        soccer: {
            gamesPlayed: 0
        },
    }
    let gamesPlayed = chance.integer({min:12, max:36});
    let points = gamesPlayed * 3;
    for(let i = 0; i < gamesPlayed; i++){
        let sport = Object.keys(sports)[chance.integer({min:0, max: Object.keys(sports).length-1})];
        sportsResults[sport].gamesPlayed += 1;
    }
    let year = chance.year({min:1990, max:2002});
    let dob = chance.birthday({year:year});
    let user = {
        name: first + " " + last,
        currentGame:null,
        username: username,
        dob: dob,
        gameHistory: [],
        points:points,
        email: first+last+'@mail.com',
        notifications: [],
        sports:sportsResults,
        friendsList:[],
        followers:[],
        gamesPlayed: gamesPlayed,
        created: true
    }
    admin.auth().createUser({email:first+last+'@mail.com',password:'letmein123'})
        .then((cred) => {
                return admin.firestore().collection('users').doc(cred.uid).set(user)
                .then((doc) => {
                    console.log('created');
                    return doc;
                })
                .catch((err) => {
                    console.log(err);
                    return err;
                })
        })
        .catch((err) => {
            return err
        })
})