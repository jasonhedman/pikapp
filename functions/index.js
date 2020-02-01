const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const moment = require('moment');
const fetch = require('node-fetch');

exports.clearGamesSchedule = functions.pubsub.schedule('every 1 hours').onRun((context) => {
    admin.firestore().collection('games').where('gameState','==','created').get()
        .then((games) => {
            games.forEach((game) => {
                if(moment().diff(moment.unix(parseInt(game.data().updated.seconds)),'hours',false) >= 1){
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
                if(moment().diff(moment.unix(parseInt(game.data().updated.seconds)),'hours',false) >= 1){
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

exports.sendPushNotification = functions.firestore.document('notifications/{id}').onCreate((snap,context) => {
    let users = []
    let notification = snap.data();
    notification.user.followers.forEach((user) => {
        users.push(admin.firestore().collection('users').doc(user).get()
            .then((user) => {
                return user.data().pushToken;
        }))
    })
    return Promise.all(users)
        .then((pushTokens) => {
            let messages = [];
            pushTokens.forEach((token) => {
                if(token !== undefined){
                    messages.push({
                        to: token,
                        data: notification.game.location,
                        title: "New Game",
                        body: `@${notification.user.username} ${notification.action[0].toUpperCase() + notification.action.substring(1)} a Game`,
                    })
                }
            })
            fetch('https://exp.host/--/api/v2/push/send', {
                method:"POST",
                headers:{
                    "Accept":"application/json",
                    "Content-Type":"application/json",
                },
                body:JSON.stringify(messages)
            })
            return messages;
        })
})