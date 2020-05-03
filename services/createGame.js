import * as firebase from "firebase";
const Chance = require("chance");
const fetch = require("node-fetch");

const createGame = async (data) => {
  let users = await firebase
    .firestore()
    .collection("users")
    .where("created", "==", true)
    .get();
  let chance = new Chance();
  firebase
    .firestore()
    .collection("games")
    .add({
      intensity: data.intensity,
      location: geo.point(
        data.location.coordinates.latitude,
        data.location.coordinates.longitude
      ),
      locationName: data.locationName,
      sport: data.sport,
      ownerId: this.props._currentUserProfile.id,
      owner: this.props._currentUserProfile,
      players: [
        {
          id: this.props._currentUserProfile.id,
          name: this.props._currentUserProfile.name,
          username: this.props._currentUserProfile.username,
          dob: this.props._currentUserProfile.dob,
        },
      ],
      gameState: "created",
      startTime: data.time,
      updated: new Date(),
      time: new Date(),
      equipment: [this.props._currentUserProfile.id],
      group: null,
      test: true
    })
    .then((game) => {
      Promise.all([
        firebase
          .firestore()
          .collection("games")
          .doc(game.id)
          .collection("messages")
          .doc()
          .set({
            content: "Game Created",
            type: "admin",
            created: new Date(),
            senderId: null,
            senderName: null,
          }),
        firebase.firestore().collection("games").doc(game.id).update({
          id: game.id,
        }),
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({
            calendar: firebase.firestore.FieldValue.arrayUnion(game.id),
          }),
      ])
    });
};

export default withAuthenticatedUser(createGame);
