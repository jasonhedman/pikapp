const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const algoliaClient = algoliasearch(
  functions.config().algolia.appid,
  functions.config().algolia.apikey
);
const collectionIndex = algoliaClient.initIndex("social");

exports.sendCollectionToAlgolia = functions.https.onRequest(
  async (req, res) => {
    const algoliaRecords = [];
    const usersSnapshot = await admin.firestore().collection("users").get();
    usersSnapshot.docs.forEach((doc) => {
      const document = doc.data();
      const location =
        document.location !== undefined
          ? {
              lat: document.location.geopoint._latitude,
              lng: document.location.geopoint._longitude,
            }
          : null;
      const user = {
        email: document.email,
        gamesPlayed: document.gamesPlayed,
        _geoLoc: location,
        id: document.id,
        objectID: document.id,
        proPicUrl: document.proPicUrl,
        name: document.name,
        type: "User",
        username: document.username,
      };
      algoliaRecords.push(user);
    });
    const groupsSnapshot = await admin.firestore().collection("groups").get();
    groupsSnapshot.docs.forEach((doc) => {
      const document = doc.data();
      const group = {
        id: document.id,
        objectID: document.id,
        private: document.private,
        sports: document.sports,
        title: document.title,
        type: "Group",
        users: document.users.length,
      };
      algoliaRecords.push(group);
    });
    collectionIndex.saveObjects(algoliaRecords, (_error, content) => {
      res.status(200).send("COLLECTION was indexed to Algolia successfully.");
    });
  }
);

exports.userOnCreate = functions.firestore
  .document("users/{uid}")
  .onCreate(async (snapshot, context) => {
    const document = snapshot.data();
    const location =
      document.location !== undefined
        ? {
            lat: document.location.geopoint._latitude,
            lng: document.location.geopoint._longitude,
          }
        : null;
    const user = {
      email: document.email,
      gamesPlayed: document.gamesPlayed,
      _geoLoc: location,
      id: document.id,
      objectID: document.id,
      proPicUrl: document.proPicUrl,
      name: document.name,
      type: "User",
      username: document.username,
    };
    await saveDocumentInAlgolia(user);
  });

exports.groupOnCreate = functions.firestore
  .document("groups/{uid}")
  .onCreate(async (snapshot, context) => {
    const document = snapshot.data();
    const group = {
      id: document.id,
      objectID: document.id,
      private: document.private,
      sports: document.sports,
      title: document.title,
      type: "Group",
      users: document.users.length,
    };
    await saveDocumentInAlgolia(group);
  });

exports.userOnUpdate = functions.firestore
  .document("users/{uid}")
  .onUpdate(async (change, context) => {
    const document = change.after.data();
    const location =
      document.location !== undefined
        ? {
            lat: document.location.geopoint._latitude,
            lng: document.location.geopoint._longitude,
          }
        : null;
    const user = {
      email: document.email,
      gamesPlayed: document.gamesPlayed,
      _geoLoc: location,
      id: document.id,
      objectID: document.id,
      proPicUrl: document.proPicUrl,
      name: document.name,
      type: "User",
      username: document.username,
    };
    await saveDocumentInAlgolia(user);
  });

exports.groupOnCreate = functions.firestore
  .document("groups/{uid}")
  .onUpdate(async (change, context) => {
    const document = change.after.data();
    const group = {
      id: document.id,
      objectID: document.id,
      private: document.private,
      sports: document.sports,
      title: document.title,
      type: "Group",
      users: document.users.length,
    };
    await saveDocumentInAlgolia(group);
  });

exports.userOnDelete = functions.firestore
  .document("users/{uid}")
  .onDelete(async (snapshot, context) => {
    const document = snapshot.data();
    const location =
      document.location !== undefined
        ? {
            lat: document.location.geopoint._latitude,
            lng: document.location.geopoint._longitude,
          }
        : null;
    const user = {
      email: document.email,
      gamesPlayed: document.gamesPlayed,
      _geoLoc: location,
      id: document.id,
      objectID: document.id,
      proPicUrl: document.proPicUrl,
      name: document.name,
      type: "User",
      username: document.username,
    };
    await deleteDocumentFromAlgolia(document);
  });

exports.groupOnDelete = functions.firestore
  .document("groups/{uid}")
  .onDelete(async (snapshot, context) => {
    const document = snapshot.data();
    const group = {
      id: document.id,
      objectID: document.id,
      private: document.private,
      sports: document.sports,
      title: document.title,
      type: "Group",
      users: document.users.length,
    };
    await deleteDocumentFromAlgolia(group);
  });

async function saveDocumentInAlgolia(doc) {
  await collectionIndex.saveObject(doc); // Adds or replaces a specific object.
}

async function deleteDocumentFromAlgolia(doc) {
  await collectionIndex.deleteObject(doc);
}
