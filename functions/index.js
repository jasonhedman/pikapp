const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const moment = require("moment");
const fetch = require("node-fetch");
const algolia = require("./algolia");

exports.sendCollectionToAlgolia = algolia.sendCollectionToAlgolia;
exports.userOnCreate = algolia.userOnCreate;
exports.userOnUpdate = algolia.userOnUpdate;
exports.userOnDelete = algolia.userOnDelete;
exports.groupOnCreate = algolia.groupOnCreate;
exports.groupOnUpdate = algolia.groupOnUpdate;
exports.groupOnDelete = algolia.groupOnDelete;

exports.clearGamesSchedule = functions.pubsub
  .schedule("every 5 minutes")
  .onRun((context) => {
    return Promise.all([
      admin
        .firestore()
        .collection("games")
        .where("gameState", "==", "created")
        .get()
        .then((games) => {
          games.forEach((game) => {
            if (
              moment().diff(
                moment.unix(parseInt(game.data().startTime.time.seconds)),
                "hours",
                false
              ) >= 1
            ) {
              admin.firestore().collection("games").doc(game.id).update({
                gameState: "complete",
              });
              game.data().players.forEach((user) => {
                admin
                  .firestore()
                  .collection("users")
                  .doc(user.id)
                  .update({
                    gamesPlayed: admin.firestore.FieldValue.increment(1),
                    points: admin.firestore.FieldValue.increment(3),
                    calendar: admin.firestore.FieldValue.arrayRemove(game.id),
                    "sports.basketball.gamesPlayed": admin.firestore.FieldValue.increment(
                      game.data().sport === "basketball" ? 1 : 0
                    ),
                    "sports.football.gamesPlayed": admin.firestore.FieldValue.increment(
                      game.data().sport === "football" ? 1 : 0
                    ),
                    "sports.frisbee.gamesPlayed": admin.firestore.FieldValue.increment(
                      game.data().sport === "frisbee" ? 1 : 0
                    ),
                    "sports.volleyball.gamesPlayed": admin.firestore.FieldValue.increment(
                      game.data().sport === "volleyball" ? 1 : 0
                    ),
                    "sports.soccer.gamesPlayed": admin.firestore.FieldValue.increment(
                      game.data().sport === "soccer" ? 1 : 0
                    ),
                    "sports.spikeball.gamesPlayed": admin.firestore.FieldValue.increment(
                      game.data().sport === "spikeball" ? 1 : 0
                    ),
                    gameHistory: admin.firestore.FieldValue.arrayUnion(game.id),
                  });
              });
            }
          });
          return;
        })
        .catch((err) => {
          console.error(err);
        }),
    ]);
  });

exports.sendPushNotification = functions.firestore
  .document("notifications/{id}")
  .onCreate((snap, context) => {
    let notification = snap.data();
    if (notification.type === "newGame") {
      let tokens = [];
      notification.to.forEach((user) => {
        admin
          .firestore()
          .collection("users")
          .doc(user)
          .update({
            notifications: admin.firestore.FieldValue.arrayUnion(snap.id),
          });
        tokens.push(
          admin
            .firestore()
            .collection("users")
            .doc(user)
            .get()
            .then((user) => {
              return user.data().pushToken;
            })
        );
      });
      return Promise.all(tokens).then((pushTokens) => {
        let messages = [];
        pushTokens.forEach((token) => {
          if (token !== undefined) {
            messages.push({
              to: token,
              data: notification.game.location,
              title: "New Game",
              body: `${notification.from.name} (@${notification.from.username}) ${notification.action} a game!`,
            });
          }
        });
        fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messages),
        });
        return messages;
      });
    }
    if (notification.type === "newGameNearby") {
      let tokens = [];
      notification.to.forEach((user) => {
        admin
          .firestore()
          .collection("users")
          .doc(user)
          .update({
            notifications: admin.firestore.FieldValue.arrayUnion(snap.id),
          });
        tokens.push(
          admin
            .firestore()
            .collection("users")
            .doc(user)
            .get()
            .then((user) => {
              return user.data().pushToken;
            })
        );
      });
      return Promise.all(tokens).then((pushTokens) => {
        let messages = [];
        pushTokens.forEach((token) => {
          if (token !== undefined) {
            messages.push({
              to: token,
              data: notification.game.location,
              title: "New Game",
              body: `${notification.from.name} (@${notification.from.username}) ${notification.action} a game nearby!`,
            });
          }
        });
        fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messages),
        });
        return messages;
      });
    }
    if (notification.type === "newPlayer") {
      let tokens = [];
      notification.to.forEach((user) => {
        admin
          .firestore()
          .collection("users")
          .doc(user.id)
          .update({
            notifications: admin.firestore.FieldValue.arrayUnion(snap.id),
          });
        tokens.push(
          admin
            .firestore()
            .collection("users")
            .doc(user.id)
            .get()
            .then((user) => {
              return user.data().pushToken;
            })
        );
      });
      return Promise.all(tokens).then((pushTokens) => {
        let messages = [];
        pushTokens.forEach((token) => {
          if (token !== undefined) {
            messages.push({
              to: token,
              data: notification.game.location,
              title: "New Player",
              body: `${notification.from.name} (@${notification.from.username}) ${notification.action} your ${notification.game.sport} game!`,
            });
          }
        });
        fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messages),
        });
        return messages;
      });
    }
    if (notification.type === "invite") {
      admin
        .firestore()
        .collection("users")
        .doc(notification.to.id)
        .update({
          notifications: admin.firestore.FieldValue.arrayUnion(snap.id),
        });
      if (notification.to.pushToken !== undefined) {
        fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: notification.to.pushToken,
            data: notification,
            title: "New Invite",
            body: `${notification.from.name} (@${notification.from.username}) just invited you to play ${notification.game.sport}`,
          }),
        });
      } else {
        return null;
      }
    }
    if (notification.type === "follower") {
      admin
        .firestore()
        .collection("users")
        .doc(notification.to.id)
        .update({
          notifications: admin.firestore.FieldValue.arrayUnion(snap.id),
        });
      if (notification.to.pushToken !== undefined) {
        fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: notification.to.pushToken,
            data: notification,
            title: "New Follower",
            body: `${notification.from.name} (@${notification.from.username}) just added you as a friend. Click to see more.`,
          }),
        });
      } else {
        return null;
      }
    }
    if (notification.type === "groupInvite") {
      admin
        .firestore()
        .collection("users")
        .doc(notification.to.id)
        .update({
          notifications: admin.firestore.FieldValue.arrayUnion(snap.id),
        });
      if (notification.to.pushToken !== undefined) {
        fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: notification.to.pushToken,
            data: notification,
            title: "New Group Invite",
            body: `${notification.from.name} (@${notification.from.username}) just invited you to join ${notification.group.title}`,
          }),
        });
      } else {
        return null;
      }
    }
    return null;
  });

exports.invite = functions.https.onCall((data, context) => {
  if (data.user.pushToken !== undefined) {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: data.user.pushToken,
        data: data,
        title: "New Invite",
        body: `${data.fromUser.name} (@${
          data.fromUser.username
        }) invited you to play ${
          data.game.sport[0].toUpperCase() + data.game.sport.substring(1)
        }`,
      }),
    });
  } else {
    return null;
  }
  return data;
});

exports.findMutualFriends = functions.https.onCall((data, context) => {
  let mutualFriends = {};
  return Promise.all(
    data.user.friendsList.map((friend, index) => {
      return admin
        .firestore()
        .collection("users")
        .doc(friend)
        .get()
        .then((user) => {
          return user.data();
        })
        .catch((err) => {
          return err;
        });
    })
  )
    .then((friends) => {
      friends.forEach((friend) => {
        friend.friendsList.forEach((friendOfFriend) => {
          if (mutualFriends[friendOfFriend] !== undefined) {
            mutualFriends[friendOfFriend] += 1;
          } else {
            if (!data.user.friendsList.includes(friendOfFriend)) {
              mutualFriends[friendOfFriend] = 1;
            }
          }
        });
      });
      let keysFiltered = Object.keys(mutualFriends).filter((friend) => {
        return friend !== data.id;
      });
      let keysSorted = keysFiltered.sort((a, b) => {
        return mutualFriends[b] - mutualFriends[a];
      });
      return keysSorted;
    })
    .then((sortedUsers) => {
      return Promise.all(
        sortedUsers.map((friend) => {
          return admin
            .firestore()
            .collection("users")
            .doc(friend)
            .get()
            .then((user) => {
              let userData = user.data();
              userData.id = user.id;
              userData.mutualFriends = mutualFriends[friend];
              return userData;
            });
        })
      ).then((users) => {
        return users.splice(data.results);
      });
    })
    .catch((err) => {
      return err;
    });
});
