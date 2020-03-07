const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const moment = require('moment');
const fetch = require('node-fetch');
const Chance = require('chance');

exports.clearGamesSchedule = functions.pubsub.schedule('every 1 hours').onRun((context) => {
    return Promise.all([
        admin.firestore().collection('games').where('gameState','==','created').get()
        .then((games) => {
            games.forEach((game) => {
                if(moment().diff(moment.unix(parseInt(game.data().updated.seconds)),'hours',false) >= 1){
                    admin.firestore().collection('games').doc(game.id).update({
                        gameState:"incomplete"
                    })
                    let users = game.data().players;
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
        }),
    admin.firestore().collection('games').where('gameState','==','inProgress').get()
        .then((games) => {
            games.forEach((game) => {
                if(moment().diff(moment.unix(parseInt(game.data().updated.seconds)),'hours',false) >= 1){
                    admin.firestore().collection('games').doc(game.id).update({
                        gameState:"incomplete"
                    })
                    let users = game.data().players;
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
    ])
})

exports.sendPushNotification = functions.firestore.document('notifications/{id}').onCreate((snap,context) => {
    let notification = snap.data();
    if(notification.type === 'newGame'){
        let tokens = [];
        notification.to.forEach((user) => {
            admin.firestore().collection('users').doc(user).update({
                'notifications':admin.firestore.FieldValue.arrayUnion(snap.id)
            })
            tokens.push(
                admin.firestore().collection('users').doc(user).get().then((user) => {
                    return user.data().pushToken;
                })
            )
        })
        return Promise.all(tokens)
            .then((pushTokens) => {
                let messages = [];
                pushTokens.forEach((token) => {
                    if(token !== undefined){
                        messages.push({
                            to: token,
                            data: notification.game.location,
                            title: "New Game",
                            body: `${notification.from.name} (@${notification.from.username}) ${notification.action} a game!`,
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
    } 
    if(notification.type === 'invite'){
        admin.firestore().collection('users').doc(notification.to.id).update({
            'notifications':admin.firestore.FieldValue.arrayUnion(snap.id)
        })
        if(notification.to.pushToken !== undefined){
            console.log(`${notification.from.name} (@${notification.from.username}) just invited you to play ${notification.game.sport}`);
            fetch('https://exp.host/--/api/v2/push/send', {
                method:"POST",
                headers:{
                    "Accept":"application/json",
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({
                    to: notification.to.pushToken,
                    data: notification,
                    title: "New Invite",
                    body: `${notification.from.name} (@${notification.from.username}) just invited you to play ${notification.game.sport}`,
                })
            })
        } else {
            return null
        }
    }
    if(notification.type === 'follower'){
        admin.firestore().collection('users').doc(notification.to.id).update({
            'notifications':admin.firestore.FieldValue.arrayUnion(snap.id)
        })
        console.log(notification.to.pushToken);
        if(notification.to.pushToken !== undefined){
            fetch('https://exp.host/--/api/v2/push/send', {
                method:"POST",
                headers:{
                    "Accept":"application/json",
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({
                    to: notification.to.pushToken,
                    data: notification,
                    title: "New Follower",
                    body: `${notification.from.name} (@${notification.from.username}) just added you as a friend. Click to see more.`,
                })
            })
        } else {
            return null
        }
    }
    return null
})

exports.invite = functions.https.onCall((data, context) => {
    if(data.user.pushToken !== undefined) {
        fetch('https://exp.host/--/api/v2/push/send', {
            method:"POST",
            headers:{
                "Accept":"application/json",
                "Content-Type":"application/json",
            },
            body:JSON.stringify({
                to: data.user.pushToken,
                data: data,
                title: "New Invite",
                body: `${data.fromUser.name} (@${data.fromUser.username}) invited you to play ${data.game.sport[0].toUpperCase() + data.game.sport.substring(1)}`,
            })
        })
    } else {
        return null;
    }
    return data;
});

exports.createUser = functions.https.onCall((data,context) => {
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
            wins:0,
            losses:0,
            ptsFor: 0,
            ptsAgainst:0
        },
        football: {
            wins:0,
            losses:0,
            ptsFor: 0,
            ptsAgainst:0
        },
        spikeball: {
            wins:0,
            losses:0,
            ptsFor: 0,
            ptsAgainst:0
        },
        volleyball: {
            wins:0,
            losses:0,
            ptsFor: 0,
            ptsAgainst:0
        },
        soccer: {
            wins:0,
            losses:0,
            ptsFor: 0,
            ptsAgainst:0
        },
    }
    let wins = 0;
    let losses = 0;
    let points = 0;
    for(let i = 0; i < data.games; i++){
        let sport = Object.keys(sports)[chance.integer({min:0, max: Object.keys(sports).length-1})];
        sportsResults[sport].gamesPlayed += 1;
        // let win = chance.bool();
        // if(win){
        //     wins+=1;
        //     sportsResults[sport].wins += 1;
        //     points += 3;
        //     sportsResults[sport].ptsFor += sports[sport];
        //     sportsResults[sport].ptsAgainst += chance.integer({min:0,max:sports[sport]-1});
        // } else {
        //     losses+=1;
        //     sportsResults[sport].losses += 1;
        //     points += 3;
        //     sportsResults[sport].ptsFor += chance.integer({min:0,max:sports[sport]-1});
        //     sportsResults[sport].ptsAgainst += sports[sport];
        // }
    }
    let year = chance.year({min:1990, max:2002});
    let dob = chance.birthday({year:year});
    let user = {
        name: first + " " + last,
        currentGame:null,
        username: username,
        dob: dob,
        gameHistory: [],
        wins: wins,
        losses: losses,
        points:points,
        email: first+last+'@mail.com',
        notifications: [],
        sports:sportsResults,
        friendsList:[],
        followers:[],
        gamesPlayed: data.games,
        created: true
    }
    admin.auth().createUser({email:first+last+'@mail.com',password:'letmein123'})
        .then((cred) => {
            return Promise.all([
                admin.firestore().collection('users').doc(cred.uid).set(user)
                .then((doc) => {
                    console.log('created');
                    return doc;
                })
                .catch((err) => {
                    console.log(err);
                    return err;
                }),
                fetch(`https://api.generated.photos/api/v1/faces?api_key=-o9RUblbajTTUQdPqenc9g&age=young-adult&per_page=1&order_by=random&gender=${gender}`)
                .then(res => res.json())
                .then(json => uploadImageAsync(json.faces[0].urls[4]["512"],cred)),
            ])
        })
        .catch((err) => {
            return err
        })
})

exports.findMutualFriends = functions.https.onCall((data,context) => {
    let mutualFriends = {};
    return Promise.all(data.user.friendsList.map((friend, index) => {
        return admin.firestore().collection('users').doc(friend).get().then((user) => {
            return user.data();
        })
        .catch((err) => {return err})
    }))
    .then((friends) => {
        friends.forEach((friend) => {
            friend.friendsList.forEach((friendOfFriend) => {
                if(mutualFriends[friendOfFriend] !== undefined){
                    mutualFriends[friendOfFriend] += 1;
                } else {
                    if(!data.user.friendsList.includes(friendOfFriend)){
                        mutualFriends[friendOfFriend] = 1;
                    }
                }
            })
        })
        let keysFiltered = Object.keys(mutualFriends).filter((friend) => {return friend !== data.id});
        let keysSorted = keysFiltered.sort((a,b) => {return mutualFriends[b]-mutualFriends[a]})
        return keysSorted;
    })
    .then((sortedUsers) => {
        return Promise.all(sortedUsers.map((friend) => {
            return admin.firestore().collection('users').doc(friend).get().then((user) => {
                let userData = user.data();
                userData.id = user.id;
                userData.mutualFriends = mutualFriends[friend];
                return userData;
            })
        }))
    })
    .catch((err) => {return err})
})

// uploadImageAsync = (uri, cred) => {
//     if(uri !== null) {
//       const blob =  new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.onload = function() {
//           resolve(xhr.response);
//         };
//         xhr.onerror = function(e) {
//           console.log(e);
//           reject(new TypeError('Network request failed'));
//         };
//         xhr.responseType = 'blob';
//         xhr.open('GET', uri, true);
//         xhr.send(null);
//       });
    
//       const ref = firebase.storage().ref().child("profilePictures/" + cred.uid);
//       const snapshot = ref.put(blob);
    
//       // We're done with the blob, close and release it
//       blob.close();
//     }
//   }