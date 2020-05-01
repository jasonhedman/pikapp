import * as firebase from "firebase";
require("firebase/functions");

export const createUserStatus = (userKey) => {
    // NOTE: I do this here so that the timestamps set below
    // are identical. It's "possible" (although unlikely) that
    // the two calls to new Date() if used in the structure, would
    // have different times.
    const tsNow = new Date();
    const thePromise = firebase
        .firestore()
        .collection("activeUserLocations")
        .doc(userKey)
        .set({
            status: "online",
            tsCreated: tsNow,
            tsUpdated: tsNow,
            tsLastLocation: null
        });
    return thePromise;
};

export const getUserStatus = (userKey) => {
    const thePromise = firebase
        .firestore()
        .collection("activeUserLocations")
        .doc(userKey)
        .get()
        .then((result) => {
            if (result == null) {
                return null;
            } else {
                return result.data();
            }
        });
    return thePromise;
};

export const upsertUserStatus = (userKey, status) => {
    const tsNow = new Date();
    const newStatus = {
        status: status,
         tsUpdated: tsNow,
    };

    const thePromise = getUserStatus(userKey).then((userStatus) => {
        // if user is not found, then set it.
        if (userStatus == null) {
            newStatus.tsCreated = tsNow;
            return firebase
                .firestore()
                .collection("activeUserLocations")
                .doc(userKey)
                .set(newStatus);
        } else {
            return firebase
                .firestore()
                .collection("activeUserLocations")
                .doc(userKey)
                .update(newStatus);
        }
    });
    return thePromise;
};


export const upsertUserLocation = (userKey, location) => {
    const tsNow = new Date();
    const newStatus = {
        tsUpdated: tsNow,
    };

    // only set last location if there's a location supplied.
    if (location) {
        newStatus.lastLocation = location;
        newStatus.tsLastLocation = tsNow;
    }

    const thePromise = getUserStatus(userKey).then((userStatus) => {
        // if user is not found, then set it.
        if (userStatus == null) {
            // NOTE: It would be a little odd to update the location for a user
            // that has no status (becuase the initial status check should have created
            // them) but if there's no record then set status to 'active' assuming something
            // got missed
            newStatus.tsCreated = tsNow;
            newStatus.status = 'active';
            return firebase
                .firestore()
                .collection("activeUserLocations")
                .doc(userKey)
                .set(newStatus);
        } else {
            return firebase
                .firestore()
                .collection("activeUserLocations")
                .doc(userKey)
                .update(newStatus);
        }
    });
    return thePromise;
};


export default {};
