import * as firebase from "firebase";
const Chance = require("chance");
const fetch = require("node-fetch");

const createUser = async () => {
  const fetchedUser = await fetch(
    `https://randomuser.me/api/?nat=us&exc=gender,registered,phone,cell,id,nat,login&gender=male`
  )
    .then((res) => res.json())
    .then((json) => {
      return json.results[0];
    });
  let chance = new Chance();
  let first = fetchedUser.name.first;
  let last = fetchedUser.name.last;
  let username;
  switch (chance.integer({ min: 0, max: 6 })) {
    case 0:
      username = first.toLowerCase() + last.toLowerCase();
      break;
    case 1:
      username = first[0].toLowerCase() + last.toLowerCase();
      break;
    case 2:
      username =
        first[0].toLowerCase() +
        last.toLowerCase() +
        chance.integer({ min: 1, max: 999 });
      break;
    case 3:
      username =
        first[0].toLowerCase() +
        last[0].toLowerCase() +
        chance.integer({ min: 1, max: 999 });
      break;
    case 4:
      username =
        first.toLowerCase() +
        last.toLowerCase() +
        chance.integer({ min: 1, max: 999 });
      break;
    case 5:
      username =
        first[0].toLowerCase() +
        last.toLowerCase() +
        chance.integer({ min: 1, max: 999 });
      break;
    case 6:
      username =
        first[0].toLowerCase() +
        last.toLowerCase() +
        chance.integer({ min: 1, max: 999 });
  }
  let sports = {
    basketball: {
      gamesPlayed: 0,
    },
    football: {
      gamesPlayed: 0,
    },
    spikeball: {
      gamesPlayed: 0,
    },
    volleyball: {
      gamesPlayed: 0,
    },
    soccer: {
      gamesPlayed: 0,
    },
    frisbee: {
      gamesPlayed: 0,
    },
  };
  let gamesPlayed = chance.integer({ min: 12, max: 36 });
  let points = gamesPlayed * 3;
  for (let i = 0; i < gamesPlayed; i++) {
    let sport = Object.keys(sports)[
      chance.integer({ min: 0, max: Object.keys(sports).length - 1 })
    ];
    sports[sport].gamesPlayed += 1;
  }
  let dob = new Date(fetchedUser.dob.date);
  let user = {
    name: first + " " + last,
    currentGame: null,
    username: username,
    dob: dob,
    gameHistory: [],
    points: points,
    email: fetchedUser.email,
    notifications: [],
    sports: sports,
    friendsList: [],
    followers: [],
    gamesPlayed: gamesPlayed,
    created: true,
    proPicUrl: fetchedUser.picture.large,
  };
  // firebase
  //   .auth()
  //   .createUserWithEmailAndPassword(fetchedUser.email, "letmein123")
  //   .then((cred) => {
  //     firebase
  //       .firestore()
  //       .collection("users")
  //       .doc(cred.user.uid)
  //       .set(user)
  //       .then((doc) => {
  //         firebase
  //           .firestore()
  //           .collection("users")
  //           .doc(cred.user.uid)
  //           .update({ id: cred.user.uid });
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   })
  //   .catch((err) => {
  //     console.log("error");
  //   });
};

export default createUser;
