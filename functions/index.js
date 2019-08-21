const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const moment = require('moment');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.clearGamesSchedule = functions.pubsub.schedule('every 1 hours').onRun((context) => {
    admin.firestore().collection('games').where('gameState','==','created').get()
        .then((games) => {
            games.forEach((game) => {
                if(moment().diff(moment.unix(parseInt(game.data().updated.seconds)),'hours',false) > 1){
                    admin.firestore().collection('games').doc(game.id).update({
                        gameState:"incomplete"
                    })
                    let users = game.data().teams.home.concat(game.data().teams.away);
                    users.forEach((user) => {
                        admin.firestore().collection('users').doc(user.id).update({
                            currentGame:null
                        })
                    })
                }
            })
            return;
        })
        .catch((err) => {
            console.error(err);
        })
    admin.firestore().collection('games').where('gameState','==','inProgress').get()
        .then((games) => {
            games.forEach((game) => {
                if(moment().diff(moment.unix(parseInt(game.data().updated.seconds)),'hours',false) > 1){
                    admin.firestore().collection('games').doc(game.id).update({
                        gameState:"incomplete"
                    })
                    let users = game.data().teams.home.concat(game.data().teams.away);
                    users.forEach((user) => {
                        admin.firestore().collection('users').doc(user.id).update({
                            currentGame:null
                        })
                    })
                }
            })
            return;

        })
        .catch((err) => {
            console.error(err);
        })
})